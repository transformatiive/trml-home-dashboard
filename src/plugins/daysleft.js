"use strict";

var render = require("../render");
var time = require("../time");
var holidays = require("../lib/holidays");

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
    rows +=
      "<div class=\"ev kind-holiday\"><span class=\"when\">" +
      render.escapeHtml(h.date.slice(8) + "/" + h.date.slice(5, 7)) +
      "</span><span class=\"what\">" +
      render.escapeHtml(h.name) +
      "</span></div>";
  });
  var body =
    "<div class=\"panel\">" +
    "<div class=\"kicker\">" +
    render.escapeHtml(String(year)) +
    "</div>" +
    "<div class=\"temp huge\">" +
    render.escapeHtml(String(left)) +
    "</div>" +
    "<div class=\"title\">dias até ao fim do ano</div>" +
    "<div class=\"sub\">" +
    render.escapeHtml(String(pct)) +
    "% do ano já passou</div>" +
    "<div class=\"kicker\">feriados PT</div>" +
    "<div class=\"list\">" +
    (rows || "<div class=\"sub\">sem feriados restantes</div>") +
    "</div></div>";
  return { title: "Dias", pluginName: "Dias do ano", body: body };
}

module.exports = { id: "daysleft", name: "Dias do ano", plugin: plugin };
