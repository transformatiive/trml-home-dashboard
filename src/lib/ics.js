"use strict";

function parseUnfolded(text) {
  var normalized = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return normalized.replace(/\n[ \t]/g, "");
}

function parseDate(value, params) {
  if (!value) return null;
  var isDate = (params && params.VALUE === "DATE") || /^\d{8}$/.test(value);
  if (isDate) {
    var y = value.slice(0, 4);
    var m = value.slice(4, 6);
    var d = value.slice(6, 8);
    return { date: new Date(Date.UTC(Number(y), Number(m) - 1, Number(d))), allDay: true };
  }
  var tz = params && (params.TZID || null);
  var match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(value);
  if (!match) return null;
  var iso = match[1] + "-" + match[2] + "-" + match[3] + "T" + match[4] + ":" + match[5] + ":" + match[6];
  if (match[7] === "Z") return { date: new Date(iso + "Z"), allDay: false, tz: "UTC" };
  if (tz) return { date: new Date(iso + "Z"), allDay: false, tz: tz, floating: true };
  return { date: new Date(iso + "Z"), allDay: false, floating: true };
}

function parseParams(raw) {
  var params = {};
  if (!raw) return params;
  raw.split(";").forEach(function (part) {
    if (!part) return;
    var eq = part.indexOf("=");
    if (eq === -1) return;
    params[part.slice(0, eq).toUpperCase()] = part.slice(eq + 1).replace(/^"|"$/g, "");
  });
  return params;
}

function unescapeIcs(value) {
  return String(value || "").replace(/\\n/gi, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}

function parseIcs(text) {
  var unfolded = parseUnfolded(text);
  var lines = unfolded.split("\n");
  var events = [];
  var calName = "";
  var current = null;
  lines.forEach(function (line) {
    if (!line) return;
    var splitAt = line.indexOf(":");
    if (splitAt === -1) return;
    var meta = line.slice(0, splitAt);
    var value = line.slice(splitAt + 1);
    var nameParts = meta.split(";");
    var key = nameParts[0].toUpperCase();
    var params = parseParams(nameParts.slice(1).join(";"));
    if (key === "X-WR-CALNAME" || key === "CALNAME") { calName = unescapeIcs(value); return; }
    if (key === "BEGIN" && value === "VEVENT") {
      current = { summary: "", description: "", location: "", status: "", attendees: [], start: null, end: null, calendar: calName };
      return;
    }
    if (key === "END" && value === "VEVENT") {
      if (current && current.start) events.push(current);
      current = null;
      return;
    }
    if (!current) return;
    if (key === "SUMMARY") current.summary = unescapeIcs(value);
    else if (key === "DESCRIPTION") current.description = unescapeIcs(value);
    else if (key === "LOCATION") current.location = unescapeIcs(value);
    else if (key === "STATUS") current.status = value.toUpperCase();
    else if (key === "DTSTART") current.start = parseDate(value, params);
    else if (key === "DTEND") current.end = parseDate(value, params);
    else if (key === "ATTENDEE") {
      current.attendees.push({
        email: (value || "").replace(/^mailto:/i, "").toLowerCase(),
        partstat: (params.PARTSTAT || "").toUpperCase(),
        cn: params.CN || "",
      });
    }
  });
  return { name: calName, events: events };
}

function isDeclined(event, selfEmail) {
  if (!event) return false;
  if (event.status === "CANCELLED") return true;
  var mine = (selfEmail || "").toLowerCase();
  var declined = false;
  event.attendees.forEach(function (a) {
    if (a.partstat === "DECLINED" && (!mine || a.email === mine)) declined = true;
  });
  return declined;
}

function isTimesheet(event) {
  var s = ((event && event.summary) || "").toLowerCase();
  return s.indexOf("timesheet") !== -1 || s.indexOf("fatura") !== -1;
}

module.exports = { parseIcs: parseIcs, isDeclined: isDeclined, isTimesheet: isTimesheet };
