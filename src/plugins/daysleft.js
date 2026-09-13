'use strict';

var time = require('../time');

function easterSunday(year) {
  var a = year % 19;
  var b = Math.floor(year / 100);
  var c = year % 100;
  var d = Math.floor(b / 4);
  var e = b % 4;
  var f = Math.floor((b + 8) / 25);
  var g = Math.floor((b - f + 1) / 3);
  var h = (19 * a + b - d - g + 15) % 30;
  var i = Math.floor(c / 4);
  var k = c % 4;
  var l = (32 + 2 * e + 2 * i - h - k) % 7;
  var m = Math.floor((a + 11 * h + 22 * l) / 451);
  var month = Math.floor((h + l - 7 * m + 114) / 31);
  var day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(date, n) {
  return new Date(date.getTime() + n * 86400000);
}

function ymd(y, month, day) {
  return y + '-' + time.pad(month) + '-' + time.pad(day);
}

function holidaysFor(year) {
  var eas = easterSunday(year);
  var goodFriday = addDays(eas, -2);
  var corpus = addDays(eas, 60);
  function fromUtc(d, name) {
    return {
      key: d.getUTCFullYear() + '-' + time.pad(d.getUTCMonth() + 1) + '-' + time.pad(d.getUTCDate()),
      name: name
    };
  }
  return [
    { key: ymd(year, 1, 1), name: 'Ano Novo' },
    fromUtc(goodFriday, 'Sexta-feira Santa'),
    fromUtc(eas, 'Páscoa'),
    { key: ymd(year, 4, 25), name: '25 de Abril' },
    { key: ymd(year, 5, 1), name: 'Dia do Trabalhador' },
    fromUtc(corpus, 'Corpo de Deus'),
    { key: ymd(year, 6, 10), name: 'Dia de Portugal' },
    { key: ymd(year, 6, 13), name: 'Santo António (Lisboa)' },
    { key: ymd(year, 8, 15), name: 'Assunção de Nossa Senhora' },
    { key: ymd(year, 10, 5), name: 'Implantação da República' },
    { key: ymd(year, 11, 1), name: 'Todos os Santos' },
    { key: ymd(year, 12, 1), name: 'Restauração da Independência' },
    { key: ymd(year, 12, 8), name: 'Imaculada Conceição' },
    { key: ymd(year, 12, 25), name: 'Natal' }
  ];
}

function load() {
  var now = new Date();
  var p = time.parts(now);
  var start = Date.UTC(p.year, 0, 1);
  var next = Date.UTC(p.year + 1, 0, 1);
  var todayUtc = Date.UTC(p.year, p.month - 1, p.day);
  var dayOfYear = Math.floor((todayUtc - start) / 86400000) + 1;
  var total = Math.round((next - start) / 86400000);
  var left = total - dayOfYear;
  var pct = Math.round((dayOfYear / total) * 100);
  var hols = holidaysFor(p.year);
  var upcoming = [];
  var i;
  for (i = 0; i < hols.length; i++) {
    if (hols[i].key >= time.lisbonDateKey(now)) upcoming.push(hols[i]);
  }
  return Promise.resolve({
    ok: true,
    year: p.year,
    dayOfYear: dayOfYear,
    total: total,
    left: left,
    pct: pct,
    holidays: upcoming.slice(0, 5)
  });
}

module.exports = { load: load, holidaysFor: holidaysFor };
