"use strict";

var http = require("http");
var fs = require("fs");
var path = require("path");
var url = require("url");
var time = require("./time");
var render = require("./render");
var playlist = require("./playlist");
var cache = require("./cache");
var calendarLib = require("./lib/calendar");
var openmeteo = require("./lib/openmeteo");
var ipma = require("./lib/ipma");
var rss = require("./lib/rss");
var httpLib = require("./lib/http");
var imap = require("./lib/imap");
var legacyApi = require("./legacy-api");

var PORT = Number(process.env.PORT || 8080);
var PUBLIC = path.join(__dirname, "..", "public");
try { require("../scripts/make-icons.js"); } catch (e) {}

var state = {
  calendar: { configured: false, events: [], next: null },
  weather: {},
  warnings: { items: [], color: "ok" },
  email: { configured: false, unseen: 0, people: [], noise: 0 },
  news: [],
  fetchedAt: null,
  errors: {},
};

function stamp(date) { return "último " + time.formatTime(date); }
var FORBIDDEN = '<!doctype html><meta charset="utf-8"><title>LG Dash</title><body style="font:16px system-ui;background:#f3f1ec;color:#1c1a17;display:grid;place-items:center;height:100vh;margin:0"><p>Acesso restrito.</p></body>';

function parseCookies(header) {
  var out = {};
  String(header || "").split(";").forEach(function (part) {
    var i = part.indexOf("=");
    if (i === -1) return;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}
function queryKey(parsed) { var q = parsed.query || {}; return String(q.k || q.token || ""); }
function providedKey(req, parsed) {
  var fromQuery = queryKey(parsed);
  if (fromQuery) return fromQuery;
  var cookies = parseCookies(req.headers.cookie);
  return cookies.lgdk || cookies.k || "";
}
function dashToken() { return process.env.DASH_TOKEN || ""; }
function isAuthorized(req, parsed) {
  var expected = dashToken();
  if (!expected) return false;
  return providedKey(req, parsed) === expected;
}
function keyQuery() {
  var t = dashToken();
  return t ? "?k=" + encodeURIComponent(t) : "";
}

async function refresh() {
  var errors = {};
  try { state.calendar = await calendarLib.fetchCalendar(); } catch (e) {
    errors.calendar = String(e.message || e);
    var cachedCal = cache.load("calendar-data"); if (cachedCal) state.calendar = cachedCal.payload;
  }
  try { state.weather = await openmeteo.fetchWeather(); } catch (e) {
    errors.weather = String(e.message || e);
    var cachedW = cache.load("weather-data"); if (cachedW) state.weather = cachedW.payload;
  }
  try { state.warnings = await ipma.fetchWarnings(); } catch (e) {
    errors.warnings = String(e.message || e);
    var cachedA = cache.load("warnings-data"); if (cachedA) state.warnings = cachedA.payload;
  }
  try {
    var xml = await httpLib.getText(process.env.PUBLICO_RSS_URL || "https://news.google.com/rss/search?q=site:publico.pt&hl=pt-PT&gl=PT&ceid=PT:pt");
    state.news = rss.parseRss(xml);
  } catch (e) {
    errors.news = String(e.message || e);
    var cachedN = cache.load("news-data"); if (cachedN) state.news = cachedN.payload;
  }
  try { state.email = await imap.fetchEmailMeter(); } catch (e) {
    errors.email = String(e.message || e);
    var cachedE = cache.load("email-data"); if (cachedE) state.email = cachedE.payload;
  }
  state.errors = errors;
  state.fetchedAt = new Date();
  cache.save("calendar-data", state.calendar);
  cache.save("weather-data", state.weather);
  cache.save("warnings-data", state.warnings);
  cache.save("news-data", state.news);
  cache.save("email-data", state.email);
}

function mime(file) {
  if (/\.css$/.test(file)) return "text/css; charset=utf-8";
  if (/\.js$/.test(file)) return "application/javascript; charset=utf-8";
  if (/\.png$/.test(file)) return "image/png";
  return "application/octet-stream";
}
function send(res, status, type, body, extra) {
  var headers = { "Content-Type": type, "Cache-Control": "no-store" };
  if (extra) Object.keys(extra).forEach(function (k) { headers[k] = extra[k]; });
  res.writeHead(status, headers);
  res.end(body);
}
function pageFor(id) {
  var found = playlist.byId(id);
  var now = time.lisbonNow();
  var view = found.plugin.plugin({
    now: now, calendar: state.calendar, weather: state.weather,
    warnings: state.warnings, email: state.email, news: state.news,
  });
  var html = render.wrap({
    theme: time.themeName(now), title: view.title, pluginName: view.pluginName,
    index: found.index + 1, total: playlist.PLUGINS.length,
    prevHref: playlist.href(found.index - 1), nextHref: playlist.href(found.index + 1),
    sky: view.sky, qs: keyQuery(),
    updated: state.fetchedAt ? stamp(state.fetchedAt) : "a actualizar", body: view.body,
  });
  cache.save("html-" + found.plugin.id, html);
  return html;
}
function adminPage() {
  var now = time.lisbonNow();
  var rows = playlist.PLUGINS.map(function (p, i) {
    return "<li>" + (i + 1) + ". <a href=\"/p/" + p.id + "\">" + render.escapeHtml(p.name) + "</a></li>";
  }).join("");
  var errKeys = Object.keys(state.errors || {});
  return "<!DOCTYPE html><html><head><meta charset=utf-8 /><title>Admin</title></head><body><h1>LG Dash</h1><p>" +
    render.escapeHtml(time.themeName(now)) + " · " + render.escapeHtml(time.formatTime(now)) +
    "</p><p>https://lgdash-production.up.railway.app/legacy.html?k=DASH_TOKEN</p>" +
    (errKeys.length ? "<p>Falhas: " + render.escapeHtml(errKeys.join(", ")) + "</p>" : "<p>Fontes ok.</p>") +
    "<ul>" + rows + "</ul></body></html>";
}

var server = http.createServer(function (req, res) {
  var parsed = url.parse(req.url, true);
  var pathname = parsed.pathname || "/";
  if (pathname === "/health") { send(res, 200, "text/plain; charset=utf-8", "ok"); return; }
  if (!isAuthorized(req, parsed)) { send(res, 401, "text/html; charset=utf-8", FORBIDDEN); return; }
  var extra = {};
  if (queryKey(parsed)) extra["Set-Cookie"] = "lgdk=" + encodeURIComponent(dashToken()) + "; Path=/";
  if (pathname === "/admin") { send(res, 200, "text/html; charset=utf-8", adminPage(), extra); return; }
  if (pathname === "/api/legacy") {
    send(res, 200, "application/json; charset=utf-8", JSON.stringify(legacyApi.buildLegacyPayload(state)), extra);
    return;
  }
  if (pathname === "/" || pathname === "/p" || pathname === "/p/" || pathname === "/legacy.html" || pathname === "/index.html") {
    send(res, 200, "text/html; charset=utf-8", pageFor("agora"), extra); return;
  }
  if (pathname.indexOf("/p/") === 0) {
    send(res, 200, "text/html; charset=utf-8", pageFor(pathname.slice(3).replace(/\/$/, "")), extra); return;
  }
  var safe = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  var file = path.join(PUBLIC, safe);
  if (file.indexOf(PUBLIC) === 0 && fs.existsSync(file) && fs.statSync(file).isFile()) {
    send(res, 200, mime(file), fs.readFileSync(file), extra); return;
  }
  send(res, 404, "text/plain; charset=utf-8", "not found", extra);
});

refresh().catch(function (err) { state.errors.boot = String(err.message || err); }).then(function () {
  server.listen(PORT, "0.0.0.0", function () { process.stdout.write("home-dashboard on " + PORT + "\n"); });
});
setInterval(function () { refresh().catch(function () {}); }, 10 * 60 * 1000);
