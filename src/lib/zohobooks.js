"use strict";

var http = require("./http");
var cache = require("../cache");

var CACHE_ID = "zoho-books-ar";
var MAX_AGE_MS = 30 * 60 * 1000;

function empty(reason) {
  return {
    configured: false,
    reason: reason || "missing",
    total: 0,
    overdueTotal: 0,
    overdueCount: 0,
    openCount: 0,
    buckets: [
      { key: "a vencer", tone: "sage", value: 0, count: 0 },
      { key: "1–30 d", tone: "amber", value: 0, count: 0 },
      { key: "31–60 d", tone: "holiday", value: 0, count: 0 },
      { key: "+60 d", tone: "alert", value: 0, count: 0 },
    ],
    clients: [],
    toBill: { label: "", total: 0, lines: [] },
  };
}

function accountsHost() {
  return process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.eu";
}

function apiHost() {
  return process.env.ZOHO_BOOKS_API_URL || "https://www.zohoapis.eu";
}

function daysPastDue(due, now) {
  if (!due) return 0;
  var d = new Date(due + "T00:00:00Z");
  if (isNaN(d.getTime())) return 0;
  return Math.floor((now.getTime() - d.getTime()) / 86400000);
}

function bucketFor(inv, now) {
  var status = String(inv.status || "").toLowerCase();
  var days = daysPastDue(inv.due_date, now);
  if (status === "overdue" || days > 0) {
    if (days > 60) return 3;
    if (days > 30) return 2;
    return 1;
  }
  return 0;
}

function roundEuro(n) {
  return Math.round(Number(n) || 0);
}

async function token() {
  var body = await http.postForm(accountsHost() + "/oauth/v2/token", {
    refresh_token: process.env.ZOHO_BOOKS_REFRESH_TOKEN,
    client_id: process.env.ZOHO_BOOKS_CLIENT_ID,
    client_secret: process.env.ZOHO_BOOKS_CLIENT_SECRET,
    grant_type: "refresh_token",
  });
  if (!body.access_token) throw new Error("zoho token missing");
  return body.access_token;
}

async function listInvoices(access, status) {
  var org = process.env.ZOHO_BOOKS_ORG_ID;
  var url =
    apiHost() +
    "/books/v3/invoices?organization_id=" +
    encodeURIComponent(org) +
    "&status=" +
    encodeURIComponent(status) +
    "&per_page=200";
  var data = await http.getJson(url, {
    headers: { Authorization: "Zoho-oauthtoken " + access },
    accept: "application/json",
  });
  return data.invoices || [];
}

function summarize(invoices, now) {
  var buckets = empty().buckets.map(function (b) {
    return { key: b.key, tone: b.tone, value: 0, count: 0 };
  });
  var clients = {};
  var total = 0;
  var overdueTotal = 0;
  var overdueCount = 0;
  invoices.forEach(function (inv) {
    var bal = roundEuro(inv.balance != null ? inv.balance : inv.total);
    if (bal <= 0) return;
    total += bal;
    var bi = bucketFor(inv, now);
    buckets[bi].value += bal;
    buckets[bi].count += 1;
    if (bi > 0) {
      overdueTotal += bal;
      overdueCount += 1;
    }
    var name = inv.customer_name || "Cliente";
    if (!clients[name]) clients[name] = { name: name, current: 0, overdue: 0, total: 0 };
    if (bi > 0) clients[name].overdue += bal;
    else clients[name].current += bal;
    clients[name].total += bal;
  });
  var list = Object.keys(clients)
    .map(function (k) {
      return clients[k];
    })
    .sort(function (a, b) {
      return b.total - a.total;
    });
  var top = list.slice(0, 4);
  if (list.length > 4) {
    var rest = list.slice(4);
    var agg = { name: "outros · " + rest.length + " clientes", current: 0, overdue: 0, total: 0 };
    rest.forEach(function (c) {
      agg.current += c.current;
      agg.overdue += c.overdue;
      agg.total += c.total;
    });
    top.push(agg);
  }
  return {
    configured: true,
    total: total,
    overdueTotal: overdueTotal,
    overdueCount: overdueCount,
    openCount: invoices.filter(function (inv) {
      return roundEuro(inv.balance != null ? inv.balance : inv.total) > 0;
    }).length,
    buckets: buckets,
    clients: top,
    toBill: { label: "", total: 0, lines: [] },
  };
}

async function fetchAr() {
  if (
    !process.env.ZOHO_BOOKS_ORG_ID ||
    !process.env.ZOHO_BOOKS_REFRESH_TOKEN ||
    !process.env.ZOHO_BOOKS_CLIENT_ID ||
    !process.env.ZOHO_BOOKS_CLIENT_SECRET
  ) {
    return empty("unconfigured");
  }
  var cached = cache.load(CACHE_ID);
  if (cached && cached.savedAt && Date.now() - Date.parse(cached.savedAt) < MAX_AGE_MS) {
    return cached.payload;
  }
  var access = await token();
  var unpaid = await listInvoices(access, "unpaid");
  var overdue = await listInvoices(access, "overdue");
  var byId = {};
  unpaid.concat(overdue).forEach(function (inv) {
    byId[inv.invoice_id || inv.invoice_number] = inv;
  });
  var invoices = Object.keys(byId).map(function (k) {
    return byId[k];
  });
  var summary = summarize(invoices, new Date());
  cache.save(CACHE_ID, summary);
  return summary;
}

module.exports = { fetchAr: fetchAr, empty: empty, summarize: summarize, bucketFor: bucketFor };
