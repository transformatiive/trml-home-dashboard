"use strict";

var http = require("./http");
var ics = require("./ics");
var time = require("../time");

function icsUrls() {
  var urls = [];
  var primary = process.env.CALENDAR_ICS_URL || "";
  var extra = process.env.CALENDAR_ICS_URLS || "";
  primary.split(",").concat(extra.split(",")).forEach(function (u) {
    var t = u.trim();
    if (t) urls.push(t);
  });
  return urls;
}

function calendarKind(name, summary) {
  var n = ((name || "") + " " + (summary || "")).toLowerCase();
  if (n.indexOf("online") !== -1) return "home";
  if (n.indexOf("afonso") !== -1 || n.indexOf("fam") !== -1) return "family";
  if (n.indexOf("holiday") !== -1 || n.indexOf("feriado") !== -1) return "holiday";
  return "work";
}

function eventEnd(ev) {
  if (ev.end && ev.end.date) return ev.end.date;
  if (ev.start && ev.start.allDay) return new Date(ev.start.date.getTime() + 86400000);
  if (ev.start) return new Date(ev.start.date.getTime() + 30 * 60 * 1000);
  return new Date();
}

async function fetchCalendar() {
  var urls = icsUrls();
  var selfEmail = process.env.CALENDAR_SELF_EMAIL || "nbarreto@transformatiive.com";
  var all = [];
  var names = [];
  var i;
  for (i = 0; i < urls.length; i++) {
    try {
      var text = await http.getText(urls[i]);
      var parsed = ics.parseIcs(text);
      names.push(parsed.name);
      parsed.events.forEach(function (ev) {
        ev.calendar = ev.calendar || parsed.name;
        all.push(ev);
      });
    } catch (err) {
      names.push("erro");
    }
  }
  var now = time.lisbonNow();
  var horizon = new Date(now.getTime() + 36 * 3600 * 1000);
  var self = selfEmail;
  var events = all
    .filter(function (ev) {
      if (!ev.start) return false;
      if (ics.isDeclined(ev, self)) return false;
      var summary = (ev.summary || "").toLowerCase();
      if (summary.indexOf("lenny") !== -1) return false;
      var start = ev.start.date;
      var end = eventEnd(ev);
      return end >= now && start <= horizon;
    })
    .map(function (ev) {
      return {
        summary: ev.summary || "(sem título)",
        start: ev.start.date,
        end: eventEnd(ev),
        allDay: !!(ev.start && ev.start.allDay),
        calendar: ev.calendar,
        kind: calendarKind(ev.calendar, ev.summary),
        timesheet: ics.isTimesheet(ev),
        happening: ev.start.date <= now && eventEnd(ev) >= now,
      };
    })
    .sort(function (a, b) {
      return a.start - b.start;
    });

  var next = null;
  for (i = 0; i < events.length; i++) {
    if (!events[i].allDay && events[i].end > now) {
      next = events[i];
      break;
    }
  }
  return {
    configured: urls.length > 0,
    calendars: names,
    events: events,
    next: next,
  };
}

module.exports = { fetchCalendar: fetchCalendar, calendarKind: calendarKind };
