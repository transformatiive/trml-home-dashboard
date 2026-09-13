"use strict";

var http = require("./http");
var time = require("../time");

function pad(n) {
  return n < 10 ? "0" + n : String(n);
}

function ymdCompact(date) {
  var p = time.parts(date);
  return p.year + p.month + p.day;
}

function parseMarginal(text) {
  var hours = [];
  String(text || "")
    .split(/\r?\n/)
    .forEach(function (line) {
      if (!/^\d{4};/.test(line)) return;
      var parts = line.split(";");
      if (parts.length < 6) return;
      var period = Number(parts[3]);
      var pt = Number(String(parts[4]).replace(",", "."));
      if (!period || isNaN(pt)) return;
      hours.push({ period: period, price: pt });
    });
  if (hours.length > 30) {
    var buckets = {};
    hours.forEach(function (h) {
      var hour = Math.ceil(h.period / (hours.length / 24));
      if (hour < 1) hour = 1;
      if (hour > 24) hour = 24;
      if (!buckets[hour]) buckets[hour] = [];
      buckets[hour].push(h.price);
    });
    hours = [];
    var i;
    for (i = 1; i <= 24; i++) {
      var arr = buckets[i] || [0];
      var sum = 0;
      arr.forEach(function (v) {
        sum += v;
      });
      hours.push({ hour: i - 1, price: Math.round((sum / arr.length) * 10) / 10 });
    }
    return hours;
  }
  return hours.map(function (h) {
    var hour = h.period - 1;
    if (hour < 0) hour = 0;
    if (hour > 23) hour = 23;
    return { hour: hour, price: Math.round(h.price * 10) / 10 };
  });
}

async function fetchDay(date) {
  var stamp = ymdCompact(date);
  var url =
    "https://www.omie.es/en/file-download?parents=marginalpdbc&filename=marginalpdbc_" +
    stamp +
    ".1";
  var text = await http.getText(url);
  return parseMarginal(text);
}

function summarize(hours, nowHour) {
  if (!hours.length) {
    return { configured: false, hours: [], remaining: [] };
  }
  var prices = hours.map(function (h) {
    return h.price;
  });
  var min = Math.min.apply(null, prices);
  var max = Math.max.apply(null, prices);
  var sum = 0;
  prices.forEach(function (p) {
    sum += p;
  });
  var avg = Math.round((sum / prices.length) * 10) / 10;
  var cheapest = hours[0];
  var peak = hours[0];
  hours.forEach(function (h) {
    if (h.price < cheapest.price) cheapest = h;
    if (h.price > peak.price) peak = h;
  });
  var remaining = hours
    .filter(function (h) {
      return h.hour >= nowHour;
    })
    .map(function (h) {
      var band = "mid";
      if (h.price <= avg * 0.92) band = "cheap";
      if (h.price >= avg * 1.08) band = "dear";
      if (h.hour === cheapest.hour) band = "cheap";
      if (h.hour === peak.hour) band = "dear";
      return {
        hour: h.hour,
        price: h.price,
        label: pad(h.hour),
        now: h.hour === nowHour,
        band: band,
      };
    });
  return {
    configured: true,
    hours: hours,
    remaining: remaining,
    min: min,
    max: max,
    avg: avg,
    cheapest: cheapest,
    peak: peak,
    now: hours.filter(function (h) {
      return h.hour === nowHour;
    })[0] || hours[0],
  };
}

async function fetchElectricity(now) {
  var date = now || time.lisbonNow();
  var hm = time.hourMinute(date);
  var today = await fetchDay(date);
  var summary = summarize(today, hm.hour);
  if (summary.remaining.length < 8) {
    try {
      var tomorrow = await fetchDay(time.addDays(date, 1));
      tomorrow.forEach(function (h) {
        if (summary.remaining.length >= 16) return;
        summary.remaining.push({
          hour: h.hour,
          price: h.price,
          label: pad(h.hour),
          now: false,
          band: h.price <= summary.avg * 0.92 ? "cheap" : h.price >= summary.avg * 1.08 ? "dear" : "mid",
          nextDay: true,
        });
      });
    } catch (e) {}
  }
  return summary;
}

module.exports = {
  parseMarginal: parseMarginal,
  fetchElectricity: fetchElectricity,
  summarize: summarize,
};
