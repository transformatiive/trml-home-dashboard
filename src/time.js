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

function pad2(n) {
  n = Number(n);
  return n < 10 ? "0" + n : String(n);
}

function weekdayIndex(date) {
  var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  var w = parts(date).weekday;
  return map[w] != null ? map[w] : 0;
}

function weekdayShortPt(date) {
  return ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"][weekdayIndex(date)];
}

function minutesOfDay(date) {
  var hm = hourMinute(date);
  return hm.hour * 60 + hm.minute;
}

function isoWeek(date) {
  var p = parts(date);
  var utc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day));
  var day = new Date(utc).getUTCDay() || 7;
  var thu = new Date(utc + (4 - day) * 86400000);
  var year = thu.getUTCFullYear();
  var yearStart = Date.UTC(year, 0, 1);
  var week = Math.ceil(((thu - yearStart) / 86400000 + 1) / 7);
  return { week: week, weeks: isoWeeksInYear(year), year: year };
}

function isoWeeksInYear(year) {
  var d = new Date(Date.UTC(year, 11, 28));
  var day = d.getUTCDay() || 7;
  var thu = new Date(Date.UTC(year, 11, 28 + (4 - day)));
  var yearStart = Date.UTC(thu.getUTCFullYear(), 0, 1);
  return Math.ceil(((thu - yearStart) / 86400000 + 1) / 7);
}

function quarterInfo(date) {
  var p = parts(date);
  var month = Number(p.month);
  var q = Math.ceil(month / 3);
  var startM = (q - 1) * 3 + 1;
  var endM = startM + 2;
  var lastDay = new Date(Date.UTC(Number(p.year), endM, 0)).getUTCDate();
  var start = fromLisbonParts(p.year, pad2(startM), "01", "00", "00");
  var end = fromLisbonParts(p.year, pad2(endM), pad2(lastDay), "23", "59");
  var elapsed = daysBetween(start, date);
  var total = daysBetween(start, end) + 1;
  return { q: q, pct: Math.round((elapsed / total) * 100) };
}

function workdaysRemaining(date, holidayYmds) {
  var block = {};
  (holidayYmds || []).forEach(function (h) {
    block[h] = true;
  });
  var n = 0;
  var cur = startOfDay(date);
  var end = endOfYear(date);
  while (cur <= end) {
    var wd = weekdayIndex(cur);
    if (wd !== 0 && wd !== 6 && !block[ymd(cur)]) n += 1;
    cur = addDays(cur, 1);
  }
  return n;
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
  pad2: pad2,
  weekdayIndex: weekdayIndex,
  weekdayShortPt: weekdayShortPt,
  minutesOfDay: minutesOfDay,
  isoWeek: isoWeek,
  isoWeeksInYear: isoWeeksInYear,
  quarterInfo: quarterInfo,
  workdaysRemaining: workdaysRemaining,
};
