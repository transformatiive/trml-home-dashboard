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
  var dayNum = Math.min(total, elapsed + 1);
  var remaining = holidays.remainingHolidays(year, today).slice(0, 3);
  var rows = "";
  remaining.forEach(function (h) {
    var dt = time.fromLisbonParts(h.date.slice(0, 4), h.date.slice(5, 7), h.date.slice(8, 10), "12", "00");
    rows += ui.listItem(
      "holiday",
      h.name,
      h.date.slice(8, 10) + "/" + h.date.slice(5, 7) + " · " + time.weekdayShortPt(dt)
    );
  });
  if (!rows) {
    rows = '<div class="body accent-sage">sem feriados restantes</div>';
  }
  var iso = time.isoWeek(now);
  var q = time.quarterInfo(now);
  var work = time.workdaysRemaining(
    now,
    holidays.portugalHolidays(year).map(function (h) {
      return h.date;
    })
  );
  var monthElapsed = Number(p.month) - 1;
  var dim = new Date(Date.UTC(year, Number(p.month), 0)).getUTCDate();
  var monthPct = Math.round((Number(p.day) / dim) * 100);
  var body =
    '<div class="panel">' +
    ui.header(String(year), pct + " % já passou · dia " + dayNum + " de " + total) +
    '<table width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td valign="bottom"><div class="hero-xl">' +
    render.escapeHtml(String(left)) +
    '</div></td><td valign="bottom"><div class="body">dias até ao fim do ano</div></td></tr></table>' +
    ui.progress(pct) +
    ui.monthStrip(monthElapsed, monthPct) +
    '<table width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td valign="top">' +
    rows +
    '</td><td class="split" width="300" valign="top">' +
    '<div class="label">semana ISO</div><div class="hero-m">' +
    render.escapeHtml(String(iso.week) + " de " + String(iso.weeks)) +
    '</div><div class="label">trimestre</div><div class="value">Q' +
    render.escapeHtml(String(q.q) + " " + String(q.pct) + " %") +
    '</div><div class="label">dias úteis restantes</div><div class="value accent-sage">' +
    render.escapeHtml(String(work)) +
    "</div></td></tr></table></div>";
  return { title: "Dias", pluginName: "Dias do ano", body: body };
}

module.exports = { id: "daysleft", name: "Dias do ano", plugin: plugin };
