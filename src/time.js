'use strict';

var TZ = 'Europe/Lisbon';

function parts(date) {
  var d = date || new Date();
  var fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
    hourCycle: 'h23'
  });
  var map = {};
  fmt.formatToParts(d).forEach(function (p) {
    map[p.type] = p.value;
  });
  return {
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10),
    day: parseInt(map.day, 10),
    hour: parseInt(map.hour, 10),
    minute: parseInt(map.minute, 10),
    second: parseInt(map.second, 10),
    weekday: map.weekday
  };
}

function isNight(date) {
  var p = parts(date);
  var mins = p.hour * 60 + p.minute;
  return mins >= 20 * 60 + 30 || mins < 8 * 60;
}

function formatTime(date) {
  var p = parts(date);
  return pad(p.hour) + ':' + pad(p.minute);
}

function formatDateLong(date) {
  return new Intl.DateTimeFormat('pt-PT', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(date);
}

function formatDateShort(date) {
  return new Intl.DateTimeFormat('pt-PT', {
    timeZone: TZ,
    day: 'numeric',
    month: 'short'
  }).format(date);
}

function pad(n) {
  return n < 10 ? '0' + n : String(n);
}

function lisbonDateKey(date) {
  var p = parts(date);
  return p.year + '-' + pad(p.month) + '-' + pad(p.day);
}

function startOfLisbonDay(date) {
  var p = parts(date);
  return Date.parse(
    p.year + '-' + pad(p.month) + '-' + pad(p.day) + 'T00:00:00+01:00'
  );
}

function minutesOfDay(date) {
  var p = parts(date);
  return p.hour * 60 + p.minute;
}

module.exports = {
  TZ: TZ,
  parts: parts,
  isNight: isNight,
  formatTime: formatTime,
  formatDateLong: formatDateLong,
  formatDateShort: formatDateShort,
  lisbonDateKey: lisbonDateKey,
  minutesOfDay: minutesOfDay,
  pad: pad,
  startOfLisbonDay: startOfLisbonDay
};
