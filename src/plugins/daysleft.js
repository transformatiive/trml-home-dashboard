"use strict";

var render = require("../render");
var time = require("../time");
var holidays = require("../lib/holidays");
var ui = require("../lib/ui");

function plugin(ctx) {
  var now = ctx.now;
  var p = time.parts(now);
  var year = Number(p.year);
  var today = time.ymd(now);
  var start = time.startOfYear(now);
  var end = time.endOfYear(now);
  var left = Math.max(0, time.daysBetween(now, end));
  var elapsed = time.daysBetween(start, now);
  var total = time.daysBetween(start, end) + 1;
  var pct = Math.round((elapsed / total) * 100);
  var remaining = holidays.remainingHolidays(year, today).slice(0, 5);
  var rows = "";
  remaining.forEach(function (h) {
    rows += ui.item(h.name, h.date.slice(8) + "/" + h.date.slice(5, 7), "", "holiday");
  });
  var body =
    '<div class="panel">' +
    ui.titleBar(String(year), pct + "% já passou") +
    '<div class="value huge">' +
    render.escapeHtml(String(left)) +
    '</div><div class="label">dias até ao fim do ano</div>' +
    ui.progress(pct) +
    '<div class="label">feriados PT</div>' +
    '<div class="list">' +
    (rows || ui.item("sem feriados restantes", "", "ok", "ok")) +
    "</div></div>";
  return { title: "Dias", pluginName: "Dias do ano", body: body };
}

module.exports = { id: "daysleft", name: "Dias do ano", plugin: plugin };
