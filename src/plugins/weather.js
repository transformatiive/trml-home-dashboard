"use strict";

var time = require("../time");
var ui = require("../lib/ui");
var render = require("../render");
var fmt = require("../lib/fmt");

function plugin(ctx) {
  var w = ctx.weather || {};
  var now = ctx.now;
  var night = time.isNight(now);
  var city = String(w.city || "Oeiras").toUpperCase();
  var meta = time.formatDateLong(now) + " · " + time.formatTime(now);
  if (ctx.errors && ctx.errors.weather && (w.fetchedAt || ctx.fetchedAt)) {
    meta = "dados de " + time.formatTime(w.fetchedAt || ctx.fetchedAt);
  }
  var uv = w.uv;
  var uvText = uv == null ? "—" : String(uv) + " " + fmt.uvLabel(uv);
  var windText =
    w.wind != null
      ? String(w.wind) + (w.windDir ? " " + w.windDir : "")
      : "—";
  var rain = w.rain24 != null ? w.rain24 : 0;
  var hourRows = (w.hours || []).slice(0, 8).map(function (h) {
    return {
      temp: h.temp,
      display: h.temp + "°",
      label: h.label + "h",
      now: h.now,
      tone: h.tone || fmt.tempTone(h.temp),
    };
  });
  var dayCards = "";
  (w.days || []).slice(0, 3).forEach(function (d, i) {
    var dt = time.fromLisbonParts(d.date.slice(0, 4), d.date.slice(5, 7), d.date.slice(8, 10), "12", "00");
    dayCards +=
      '<td class="daycard' +
      (i ? " split" : "") +
      '" valign="top" align="left" width="33%">' +
      ui.wxIcon(d.code, false, 34) +
      '<div class="label">' +
      render.escapeHtml(time.weekdayShortPt(dt) + " " + d.date.slice(8, 10) + "/" + d.date.slice(5, 7)) +
      '</div><div class="value">' +
      render.escapeHtml(String(d.max) + "° / " + String(d.min) + "°") +
      '</div><div class="body-sm">' +
      render.escapeHtml(d.label) +
      "</div></td>";
  });
  var body =
    '<div class="panel">' +
    ui.header(city, meta) +
    '<table class="hero" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td width="46%" valign="top">' +
    ui.wxIcon(w.code, night, 64) +
    '<div class="hero-l">' +
    (w.temp != null ? render.escapeHtml(String(w.temp) + "°") : "—") +
    '</div><div class="body">' +
    render.escapeHtml(w.label || "") +
    '</div><div class="label">sensação ' +
    render.escapeHtml(w.feels != null ? String(w.feels) + "°" : "—") +
    " · máx " +
    render.escapeHtml(w.max != null ? String(w.max) + "°" : "—") +
    " mín " +
    render.escapeHtml(w.min != null ? String(w.min) + "°" : "—") +
    "</div></td>" +
    '<td width="54%" valign="top">' +
    ui.statRow("vento", windText, "km/h") +
    ui.statRow("humidade", w.humidity != null ? String(w.humidity) : "—", "%") +
    ui.statRow("UV", uvText, "", uv != null && uv >= 6 ? "amber" : "") +
    ui.statRow("chuva 24 h", rain, "mm", rain > 0 ? "slate" : "") +
    "</td></tr></table>" +
    ui.vBars(hourRows, { field: "temp" }) +
    '<table class="days footer-line" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    dayCards +
    "</tr></table></div>";
  return { title: "Tempo", pluginName: "Tempo", body: body };
}

module.exports = { id: "weather", name: "Tempo", plugin: plugin };
