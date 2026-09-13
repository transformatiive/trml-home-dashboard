"use strict";

var render = require("../render");
var time = require("../time");

function minutesUntil(date, now) {
  return Math.round((date - now) / 60000);
}

function plugin(ctx) {
  var now = ctx.now;
  var cal = ctx.calendar || {};
  var weather = ctx.weather || {};
  var warnings = ctx.warnings || {};
  var next = cal.next;
  var nextHtml;
  var warnClass = warnings.color || "ok";
  var warnLabel = "sem avisos";
  if (warnings.items && warnings.items.length) {
    warnLabel = warnings.items[0].type + " · " + warnings.items[0].level;
  }
  if (next) {
    var mins = minutesUntil(next.start, now);
    var when =
      mins <= 0
        ? "a acontecer"
        : mins < 60
          ? "daqui a " + mins + " min"
          : time.formatTime(next.start);
    nextHtml =
      "<div class=\"kicker\">próximo</div>" +
      "<div class=\"line\">" +
      render.escapeHtml(next.summary) +
      "</div>" +
      "<div class=\"sub " +
      (mins > 0 && mins <= 30 ? "amber" : "") +
      "\">" +
      render.escapeHtml(when) +
      "</div>";
  } else {
    nextHtml =
      "<div class=\"kicker\">próximo</div><div class=\"line\">Agenda livre</div><div class=\"sub sage\">sem eventos nas próximas horas</div>";
  }

  var body =
    "<div class=\"panel agora\">" +
    "<div class=\"kicker\">Lisboa</div>" +
    "<div class=\"clock\">" +
    render.escapeHtml(time.formatTime(now)) +
    "</div>" +
    "<div class=\"date\">" +
    render.escapeHtml(time.formatDateLong(now)) +
    "</div>" +
    "<table class=\"split\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\"><tr>" +
    "<td class=\"col\" width=\"60%\" valign=\"top\">" +
    nextHtml +
    "</td>" +
    "<td class=\"col\" width=\"40%\" valign=\"top\">" +
    "<div class=\"kicker\">tempo</div>" +
    "<div class=\"temp\">" +
    (weather.temp != null ? render.escapeHtml(String(weather.temp)) + "°" : "—") +
    "</div>" +
    "<div class=\"sub\">" +
    render.escapeHtml(weather.label || "") +
    "</div>" +
    "<div class=\"dot " +
    render.attr(warnClass) +
    "\"></div>" +
    "<div class=\"sub\">" +
    render.escapeHtml(warnLabel) +
    "</div>" +
    "</td></tr></table>" +
    "</div>";

  return {
    title: "Agora",
    pluginName: "Agora",
    sky: weather.sky || "",
    body: body,
  };
}

module.exports = { id: "agora", name: "Agora", plugin: plugin };
