"use strict";

var http = require("./http");
var cache = require("../cache");
var time = require("../time");

var CACHE_ID = "openrouter-spend";
var RATE_ID = "usd-eur";
var MAX_AGE_MS = 60 * 60 * 1000;

function empty(reason) {
  return {
    configured: false,
    reason: reason || "missing",
    spent: 0,
    prevSpent: 0,
    projected: 0,
    delta: 0,
    balance: 0,
    workspaces: [],
    months: [],
    topModel: "",
    topModelPct: 0,
    tokens: 0,
    rate: 1,
  };
}

function monthKey(date) {
  var p = time.parts(date);
  return p.year + "-" + p.month;
}

function monthLabel(key) {
  var n = Number(key.slice(5));
  return ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][n - 1] || key;
}

async function usdEurRate() {
  var cached = cache.load(RATE_ID);
  if (cached && cached.savedAt && Date.now() - Date.parse(cached.savedAt) < 12 * 3600 * 1000) {
    return Number(cached.payload) || 1;
  }
  try {
    var data = await http.getJson("https://api.frankfurter.app/latest?from=USD&to=EUR");
    var rate = data && data.rates ? Number(data.rates.EUR) : 1;
    if (!rate) rate = 1;
    cache.save(RATE_ID, rate);
    return rate;
  } catch (e) {
    return (cached && cached.payload) || 1;
  }
}

function costOf(row) {
  if (row == null) return 0;
  if (typeof row.cost === "number") return row.cost;
  if (row.usage && typeof row.usage.cost === "number") return row.usage.cost;
  if (typeof row.amount === "number") return row.amount;
  if (row.native_tokens_cost) return Number(row.native_tokens_cost) || 0;
  return 0;
}

function tokensOf(row) {
  var u = row.usage || row;
  return Number(u.prompt_tokens || u.tokens_prompt || 0) + Number(u.completion_tokens || u.tokens_completion || 0);
}

function workspaceOf(row) {
  return (
    row.workspace ||
    row.app ||
    row.application ||
    (row.meta && (row.meta.workspace || row.meta.app)) ||
    row.model ||
    "outros"
  );
}

function isRnd(name) {
  var n = String(name || "").toLowerCase();
  return n.indexOf("i&d") !== -1 || n.indexOf("research") !== -1 || n.indexOf("internal") !== -1;
}

function aggregate(rows, rate, now) {
  var thisKey = monthKey(now);
  var prevDate = new Date(now.getTime());
  prevDate.setUTCMonth(prevDate.getUTCMonth() - 1);
  var prevKey = monthKey(prevDate);
  var spent = 0;
  var prevSpent = 0;
  var tokens = 0;
  var byWs = {};
  var byModel = {};
  var byMonth = {};
  (rows || []).forEach(function (row) {
    var when = row.date || row.created_at || row.createdAt;
    var dt = when ? new Date(when) : now;
    if (isNaN(dt.getTime())) dt = now;
    var key = monthKey(dt);
    var eur = costOf(row) * rate;
    byMonth[key] = (byMonth[key] || 0) + eur;
    if (key === thisKey) {
      spent += eur;
      tokens += tokensOf(row);
      var ws = workspaceOf(row);
      if (!byWs[ws]) byWs[ws] = 0;
      byWs[ws] += eur;
      var model = row.model || "modelo";
      byModel[model] = (byModel[model] || 0) + 1;
    }
    if (key === prevKey) prevSpent += eur;
  });
  var list = Object.keys(byWs)
    .map(function (name) {
      return {
        name: name,
        value: byWs[name],
        tone: isRnd(name) ? "sage" : name === "outros" ? "inert" : "slate",
      };
    })
    .sort(function (a, b) {
      return b.value - a.value;
    });
  var top = list.slice(0, 5);
  if (list.length > 5) {
    var rest = list.slice(5);
    var sum = 0;
    rest.forEach(function (r) {
      sum += r.value;
    });
    top.push({ name: "outros", value: sum, tone: "inert" });
  }
  var models = Object.keys(byModel).sort(function (a, b) {
    return byModel[b] - byModel[a];
  });
  var modelTotal = 0;
  Object.keys(byModel).forEach(function (k) {
    modelTotal += byModel[k];
  });
  var p = time.parts(now);
  var day = Number(p.day);
  var dim = new Date(Date.UTC(Number(p.year), Number(p.month), 0)).getUTCDate();
  var projected = day ? (spent / day) * dim : spent;
  var months = [];
  var i;
  for (i = 5; i >= 0; i--) {
    var d = new Date(now.getTime());
    d.setUTCMonth(d.getUTCMonth() - i);
    var k = monthKey(d);
    months.push({
      key: k,
      label: monthLabel(k),
      value: byMonth[k] || 0,
      current: k === thisKey,
    });
  }
  return {
    spent: spent,
    prevSpent: prevSpent,
    projected: projected,
    delta: spent - prevSpent,
    workspaces: top,
    months: months,
    topModel: models[0] || "",
    topModelPct: modelTotal ? Math.round((byModel[models[0]] / modelTotal) * 100) : 0,
    tokens: tokens,
    day: day,
    dim: dim,
  };
}

async function fetchOpenRouter() {
  var key = process.env.OPENROUTER_API_KEY;
  if (!key) return empty("unconfigured");
  var cached = cache.load(CACHE_ID);
  if (cached && cached.savedAt && Date.now() - Date.parse(cached.savedAt) < MAX_AGE_MS) {
    return cached.payload;
  }
  var rate = await usdEurRate();
  var headers = { Authorization: "Bearer " + key, accept: "application/json" };
  var credits = { total_credits: 0, total_usage: 0 };
  try {
    var c = await http.getJson("https://openrouter.ai/api/v1/credits", { headers: headers });
    credits = c.data || c;
  } catch (e) {}
  var rows = [];
  try {
    var act = await http.getJson("https://openrouter.ai/api/v1/activity", { headers: headers });
    if (Array.isArray(act)) rows = act;
    else if (Array.isArray(act.data)) rows = act.data;
    else if (act.generations) rows = act.generations;
  } catch (e) {}
  var agg = aggregate(rows, rate, time.lisbonNow());
  var balanceUsd = Number(credits.total_credits || 0) - Number(credits.total_usage || 0);
  var payload = {
    configured: true,
    spent: agg.spent,
    prevSpent: agg.prevSpent,
    projected: agg.projected,
    delta: agg.delta,
    balance: balanceUsd * rate,
    workspaces: agg.workspaces,
    months: agg.months,
    topModel: agg.topModel,
    topModelPct: agg.topModelPct,
    tokens: agg.tokens,
    rate: rate,
    day: agg.day,
    dim: agg.dim,
  };
  cache.save(CACHE_ID, payload);
  return payload;
}

module.exports = { fetchOpenRouter: fetchOpenRouter, empty: empty, aggregate: aggregate };
