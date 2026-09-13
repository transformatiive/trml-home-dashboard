"use strict";

var time = require("../time");
var ui = require("../lib/ui");
var render = require("../render");
var fmt = require("../lib/fmt");

function minsUntil(date, now) {
  return Math.round((date - now) / 60000);
}

function eventContext(ev) {
  var bits = [];
  if (ev.location) bits.push(ev.location);
  else if (ev.calendar) bits.push(ev.calendar);
  if (ev.allDay) bits.push("todo o dia");
  return bits.join(" · ");
}

function eventTime(ev) {
  if (ev.allDay) return "dia";
  return time.formatTime(ev.start);
}

function timedBlocks(events, now) {
  var today = time.ymd(now);
  var out = [];
  (events || []).forEach(function (ev) {
    if (ev.allDay) return;
    if (time.ymd(ev.start) !== today) return;
    var start = time.minutesOfDay(ev.start);
    var end = time.minutesOfDay(ev.end);
    if (end <= start) end = start + 30;
    out.push({
      startMin: start,
      durationMin: end - start,
      tone: ui.kindTone(ev.kind),
    });
  });
  return out;
}

function loadSplit(events) {
  var foco = 0;
  var meet = 0;
  var move = 0;
  (events || []).forEach(function (ev) {
    if (ev.allDay) return;
    var dur = Math.max(0, (ev.end - ev.start) / 60000);
    var kind = ev.kind;
    if (kind === "foco") foco += dur;
    else if (kind === "viagem") move += dur;
    else meet += dur;
  });
  var total = Math.max(1, foco + meet + move);
  return {
    foco: Math.round(foco),
    meet: Math.round(meet),
    move: Math.round(move),
    segs: [
      { pct: Math.round((foco / total) * 100), tone: "sage" },
      { pct: Math.round((meet / total) * 100), tone: "slate" },
      { pct: Math.round((move / total) * 100), tone: "amber" },
    ],
  };
}

function plugin(ctx) {
  var cal = ctx.calendar || {};
  var now = ctx.now;
  var today = time.ymd(now);
  var tomorrow = time.ymd(time.addDays(now, 1));
  var events = cal.events || [];
  var fromNow = events.filter(function (ev) {
    return ev.end >= now;
  });
  var extra = 0;
  var list = fromNow.slice(0, 6);
  if (fromNow.length > 6) extra = fromNow.length - 6;
  var rows = "";
  if (!cal.configured) {
    rows = ui.listItem("warn", "Calendário sem ICS", "Definir CALENDAR_ICS_URL no Railway");
  } else if (!list.length) {
    rows = '<div class="body accent-sage">Agenda livre</div>';
  } else {
    list.forEach(function (ev) {
      rows += ui.listItem(ui.kindTone(ev.kind), ev.summary, eventContext(ev), eventTime(ev));
    });
  }
  var next = cal.next;
  var nextHtml;
  if (next) {
    var mins = minsUntil(next.start, now);
    var when = mins <= 0 ? "a acontecer" : "daqui a " + mins + " min";
    nextHtml =
      '<div class="label">a seguir</div><div class="body ' +
      ui.accentClass(ui.kindTone(next.kind)) +
      '" style="font-size:28px">' +
      render.escapeHtml(fmt.clip(next.summary, 42)) +
      '</div><div class="hero-m">' +
      render.escapeHtml(when) +
      "</div>";
  } else {
    nextHtml = '<div class="label">a seguir</div><div class="body accent-sage">Agenda livre</div>';
  }
  var carga = loadSplit(events.filter(function (ev) {
    return time.ymd(ev.start) === today || (!ev.allDay && ev.start <= now && ev.end >= now);
  }));
  var tomRows = "";
  events
    .filter(function (ev) {
      return time.ymd(ev.start) === tomorrow;
    })
    .slice(0, 3)
    .forEach(function (ev) {
      tomRows +=
        '<div class="label">' +
        render.escapeHtml(eventTime(ev) + "  " + fmt.clip(ev.summary, 28)) +
        "</div>";
    });
  if (!tomRows) tomRows = '<div class="label">sem eventos</div>';
  var meta =
    time.formatDateLong(now) +
    " · " +
    time.formatTime(now) +
    " · " +
    fromNow.length +
    " eventos" +
    (extra ? " · +" + extra + " mais" : "");
  var body =
    '<div class="panel">' +
    ui.header("Hoje", meta) +
    '<table width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td width="56" valign="top">' +
    ui.dayColumn(timedBlocks(events, now)) +
    '</td><td valign="top" style="padding-left:18px">' +
    rows +
    '</td><td class="split" width="286" valign="top">' +
    nextHtml +
    '<div class="label">carga do dia</div>' +
    '<div class="value">foco ' +
    render.escapeHtml(String(Math.round(carga.foco / 60))) +
    " h · reuniões " +
    render.escapeHtml(String(Math.round(carga.meet / 60))) +
    " h · deslocação " +
    render.escapeHtml(String(Math.round(carga.move / 60))) +
    " h</div>" +
    ui.hBar("", carga.segs, "") +
    '<div class="label">amanhã</div>' +
    tomRows +
    "</td></tr></table></div>";
  return { title: "Calendário", pluginName: "Calendário", body: body };
}

module.exports = { id: "calendar", name: "Calendário", plugin: plugin };
