"use strict";

var time = require("../time");
var ui = require("../lib/ui");
var render = require("../render");

function plugin(ctx) {
  var w = ctx.weather || {};
  var night = time.isNight(ctx.now);
  var days = "";
  (w.days || []).slice(0, 3).forEach(function (d) {
    days +=
      '<td class="daycard" valign="top" align="left">' +
      '<div class="label">' +
      render.escapeHtml(d.date.slice(8) + "/" + d.date.slice(5, 7)) +
      '</div><div class="value-sm">' +
      render.escapeHtml(String(d.max)) +
      "° / " +
      render.escapeHtml(String(d.min)) +
      '°</div><div class="item-sec">' +
      render.escapeHtml(d.label) +
      "</div></td>";
  });
  var hourCells = "";
  (w.hours || []).slice(0, 8).forEach(function (h) {
    hourCells +=
      '<td class="hourcell' +
      (h.now ? " now" : "") +
      '" align="left" valign="top">' +
      '<div class="value-sm">' +
      render.escapeHtml(String(h.temp)) +
      '°</div><div class="label">' +
      render.escapeHtml(h.label) +
      "h</div></td>";
  });
  var body =
    '<div class="panel">' +
    ui.titleBar(w.city || "Oeiras", w.label || "Tempo") +
    '<table class="hero" width="100%"><tr>' +
    '<td width="46%" valign="top">' +
    ui.wxIcon(w.code, night, 56) +
    '<div class="value huge">' +
    (w.temp != null ? render.escapeHtml(String(w.temp)) + "°" : "—") +
    "</div></td>" +
    '<td width="54%" valign="top">' +
    '<table class="metrics" width="100%"><tr>' +
    ui.metric((w.wind != null ? w.wind : "—") + " km/h", "vento") +
    ui.metric((w.humidity != null ? w.humidity : "—") + "%", "humidade") +
    ui.metric(w.uv != null ? String(w.uv) : "—", "UV") +
    "</tr></table></td></tr></table>" +
    '<div class="label">hoje</div>' +
    '<table class="hours" width="100%"><tr>' +
    hourCells +
    "</tr></table>" +
    '<div class="label">três dias</div>' +
    '<table class="days" width="100%"><tr>' +
    days +
    "</tr></table></div>";
  return { title: "Tempo", pluginName: "Tempo", body: body };
}

module.exports = { id: "weather", name: "Tempo", plugin: plugin };
