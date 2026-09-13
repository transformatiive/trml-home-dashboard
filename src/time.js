"use strict";

var TZ = process.env.TZ || "Europe/Lisbon";

function parts(date) {
  var fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  var map = {};
  fmt.formatToParts(date).forEach(function (p) {
    map[p.type] = p.value;
  });
  return map;
}

function lisbonNow() {
  return new Date();
}

function hourMinute(date) {
  var p = parts(date);
  return { hour: parseInt(p.hour, 10), minute: parseInt(p.minute, 10) };
}

function isNight(date) {
  var hm = hourMinute(date || lisbonNow());
  return hm.hour > 20 || (hm.hour === 20 && hm.minute >= 30) || hm.hour < 8;
}

function themeName(date) {
  return isNight(date) ? "night" : "day";
}

function formatTime(date) {
  var p = parts(date);
  return p.hour + ":" + p.minute;
}

function formatDateLong(date) {
  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function formatDayShort(date) {
  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function ymd(date) {
  var p = parts(date);
  return p.year + "-" + p.month + "-" + p.day;
}

function startOfDay(date) {
  var p = parts(date);
  return fromLisbonParts(p.year, p.month, p.day, "00", "00");
}

function fromLisbonParts(year, month, day, hour, minute) {
  var iso =
    year +
    "-" +
    month +
    "-" +
    day +
    "T" +
    hour +
    ":" +
    minute +
    ":00";
  var asUtc = new Date(iso + "Z");
  var shown = parts(asUtc);
  var wantMin =
    parseInt(hour, 10) * 60 + parseInt(minute, 10);
  var gotMin = parseInt(shown.hour, 10) * 60 + parseInt(shown.minute, 10);
  var delta = (gotMin - wantMin) * 60 * 1000;
  return new Date(asUtc.getTime() - delta);
}

function addDays(date, n) {
  return new Date(date.getTime() + n * 86400000);
}

function startOfYear(date) {
  var p = parts(date);
  return fromLisbonParts(p.year, "01", "01", "00", "00");
}

function endOfYear(date) {
  var p = parts(date);
  return fromLisbonParts(p.year, "12", "31", "23", "59");
}

function daysBetween(a, b) {
  return Math.round((startOfDay(b) - startOfDay(a)) / 86400000);
}

module.exports = {
  TZ: TZ,
  parts: parts,
  lisbonNow: lisbonNow,
  hourMinute: hourMinute,
  isNight: isNight,
  themeName: themeName,
  formatTime: formatTime,
  formatDateLong: formatDateLong,
  formatDayShort: formatDayShort,
  ymd: ymd,
  startOfDay: startOfDay,
  fromLisbonParts: fromLisbonParts,
  addDays: addDays,
  startOfYear: startOfYear,
  endOfYear: endOfYear,
  daysBetween: daysBetween,
};
