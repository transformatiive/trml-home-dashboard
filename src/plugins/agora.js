"use strict";

var time = require("../time");
var ui = require("../lib/ui");
var render = require("../render");

function minutesUntil(date, now) {
  return Math.round((date - now) / 60000);
}

function plugin(ctx) {
  var now = ctx.now;
  var cal = ctx.calendar || {};
  var weather = ctx.weather || {};
  var warnings = ctx.warnings || {};
  var night = time.isNight(now);
  var next = cal.next;
  var warnLabel = "sem avisos";
  var warnIcon = "icon-ok";
  if (warnings.items && warnings.items.length) {
    warnLabel = warnings.items[0].type + " · " + warnings.items[0].level;
    warnIcon = "icon-warn";
  }
  var nextBlock;
  if (next) {
    var mins = minutesUntil(next.start, now);
    var when =
      mins <= 0
        ? "a acontecer"
        : mins < 60
          ? "daqui a " + mins + " min"
          : time.formatTime(next.start);
    nextBlock = ui.item(ui.kindIcon(next.kind), next.summary, when, mins > 0 && mins <= 30 ? "hot" : "");
  } else {
    nextBlock = ui.item("icon-cal", "Agenda livre", "sem eventos nas próximas horas");
  }

  var hours = (weather.hours || []).slice(0, 8);
  var hourCells = "";
  hours.forEach(function (h) {
    hourCells +=
      '<td class="hourcell' +
      (h.now ? " now" : "") +
      '" align="center" valign="top">' +
      ui.wxIcon(h.code, h.hour >= 21 || h.hour < 8, 32) +
      '<div class="value-sm">' +
      render.escapeHtml(String(h.temp)) +
      '°</div><div class="label">' +
      render.escapeHtml(h.label) +
      "h</div></td>";
  });

  var body =
    '<div class="panel">' +
    ui.titleBar("icon-clock", "Agora", weather.city || "Oeiras") +
    '<table class="hero" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td width="58%" valign="top">' +
    '<div class="value huge">' +
    render.escapeHtml(time.formatTime(now)) +
    '</div><div class="label">' +
    render.escapeHtml(time.formatDateLong(now)) +
    "</div>" +
    nextBlock +
    "</td>" +
    '<td width="42%" valign="top" align="center">' +
    ui.wxIcon(weather.code, night, 72) +
    '<div class="value">' +
    (weather.temp != null ? render.escapeHtml(String(weather.temp)) + "°" : "—") +
    '</div><div class="label">' +
    render.escapeHtml(weather.label || "") +
    "</div>" +
    ui.item(warnIcon, warnLabel, "IPMA Lisboa") +
    "</td></tr></table>" +
    '<div class="label">Próximas horas</div>' +
    '<table class="hours" width="100%"><tr>' +
    hourCells +
    "</tr></table></div>";

  return { title: "Agora", pluginName: "Agora", body: body };
}

module.exports = { id: "agora", name: "Agora", plugin: plugin };
