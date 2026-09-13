"use strict";

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
  return { month: month, day: day };
}

function pad(n) {
  return n < 10 ? "0" + n : String(n);
}

function ymdFromParts(year, month, day) {
  return year + "-" + pad(month) + "-" + pad(day);
}

function addDaysYmd(year, month, day, delta) {
  var dt = new Date(Date.UTC(year, month - 1, day + delta));
  return ymdFromParts(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

function portugalHolidays(year) {
  var e = easterSunday(year);
  var goodFriday = addDaysYmd(year, e.month, e.day, -2);
  var easter = ymdFromParts(year, e.month, e.day);
  var corpus = addDaysYmd(year, e.month, e.day, 60);
  return [
    { date: ymdFromParts(year, 1, 1), name: "Ano Novo" },
    { date: goodFriday, name: "Sexta-feira Santa" },
    { date: easter, name: "Páscoa" },
    { date: ymdFromParts(year, 4, 25), name: "Dia da Liberdade" },
    { date: ymdFromParts(year, 5, 1), name: "Dia do Trabalhador" },
    { date: corpus, name: "Corpo de Deus" },
    { date: ymdFromParts(year, 6, 10), name: "Dia de Portugal" },
    { date: ymdFromParts(year, 6, 13), name: "Santo António (Lisboa)" },
    { date: ymdFromParts(year, 8, 15), name: "Assunção de Nossa Senhora" },
    { date: ymdFromParts(year, 10, 5), name: "Implantação da República" },
    { date: ymdFromParts(year, 11, 1), name: "Todos os Santos" },
    { date: ymdFromParts(year, 12, 1), name: "Restauração da Independência" },
    { date: ymdFromParts(year, 12, 8), name: "Imaculada Conceição" },
    { date: ymdFromParts(year, 12, 25), name: "Natal" },
  ];
}

function remainingHolidays(year, todayYmd) {
  return portugalHolidays(year).filter(function (h) {
    return h.date >= todayYmd;
  });
}

module.exports = {
  easterSunday: easterSunday,
  portugalHolidays: portugalHolidays,
  remainingHolidays: remainingHolidays,
};
