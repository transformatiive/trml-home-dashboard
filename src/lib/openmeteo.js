"use strict";

var fmt = require("./fmt");
var http = require("./http");
var time = require("../time");

var LAT = process.env.LATITUDE || "38.697";
var LON = process.env.LONGITUDE || "-9.310";
var CITY = process.env.CITY || "Oeiras";

function skyFromCode(code, isNight) {
  if (code === 0) return isNight ? "clear-night" : "clear";
  if (code <= 3) return isNight ? "cloud-night" : "partly";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "rain";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 95) return "storm";
  return "partly";
}

function labelFromCode(code) {
  if (code === 0) return "Céu limpo";
  if (code === 1) return "Principalmente limpo";
  if (code === 2) return "Parcialmente nublado";
  if (code === 3) return "Nublado";
  if (code === 45 || code === 48) return "Nevoeiro";
  if (code >= 51 && code <= 57) return "Chuvisco";
  if (code >= 61 && code <= 67) return "Chuva";
  if (code >= 71 && code <= 77) return "Neve";
  if (code >= 80 && code <= 82) return "Aguaceiros";
  if (code >= 95) return "Trovoada";
  return "Céu variável";
}

function parseIsoLocal(iso) {
  var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso || "");
  if (!m) return { hour: 0, minute: 0, ymd: "" };
  return { hour: Number(m[4]), minute: Number(m[5]), ymd: m[1] + "-" + m[2] + "-" + m[3] };
}

function stampToMin(iso) {
  var p = parseIsoLocal(iso);
  if (!p.ymd) return 0;
  return p.hour * 60 + p.minute;
}

async function fetchWeather() {
  var night = time.isNight();
  var url =
    "https://api.open-meteo.com/v1/forecast?latitude=" +
    encodeURIComponent(LAT) +
    "&longitude=" +
    encodeURIComponent(LON) +
    "&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m,apparent_temperature" +
    "&hourly=temperature_2m,weather_code,wind_speed_10m,precipitation" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum" +
    "&timezone=Europe%2FLisbon&forecast_days=4&past_days=1";
  var data = await http.getJson(url);
  var cur = data.current || {};
  var daily = data.daily || {};
  var hourly = data.hourly || {};
  var code = Number(cur.weather_code || 0);
  var now = time.lisbonNow();
  var today = time.ymd(now);
  var hm = time.hourMinute(now);
  var days = [];
  var i;
  for (i = 0; i < (daily.time || []).length; i++) {
    days.push({
      date: daily.time[i],
      code: Number(daily.weather_code[i]),
      label: labelFromCode(Number(daily.weather_code[i])),
      max: Math.round(daily.temperature_2m_max[i]),
      min: Math.round(daily.temperature_2m_min[i]),
      sunrise: daily.sunrise[i],
      sunset: daily.sunset[i],
      uv: daily.uv_index_max ? Math.round(daily.uv_index_max[i] * 10) / 10 : null,
      rain: daily.precipitation_sum ? Math.round(daily.precipitation_sum[i] * 10) / 10 : 0,
    });
  }
  var hours = [];
  var rain24 = 0;
  for (i = 0; i < (hourly.time || []).length; i++) {
    var parsed = parseIsoLocal(hourly.time[i]);
    var isToday = parsed.ymd === today;
    var upcoming = isToday && parsed.hour >= hm.hour;
    var tomorrow = parsed.ymd > today;
    if (!upcoming && !(tomorrow && hours.length < 16)) continue;
    if (hours.length >= 16) continue;
    var tempHour = Math.round(hourly.temperature_2m[i]);
    hours.push({
      hour: parsed.hour,
      label: fmt.pad2(parsed.hour),
      temp: tempHour,
      wind: Math.round(hourly.wind_speed_10m[i]),
      code: Number(hourly.weather_code[i]),
      now: isToday && parsed.hour === hm.hour,
      ymd: parsed.ymd,
      tone: fmt.tempTone(tempHour),
    });
  }
  rain24 = 0;
  var cutoff = now.getTime() - 24 * 3600 * 1000;
  for (i = 0; i < (hourly.time || []).length; i++) {
    var ts = Date.parse(hourly.time[i]);
    if (!isNaN(ts) && ts >= cutoff && ts <= now.getTime()) {
      rain24 += hourly.precipitation ? Number(hourly.precipitation[i] || 0) : 0;
    }
  }
  var todayRow = null;
  var yestRow = null;
  for (i = 0; i < days.length; i++) {
    if (days[i].date === today) todayRow = days[i];
    if (days[i].date === time.ymd(time.addDays(now, -1))) yestRow = days[i];
  }
  if (!todayRow) todayRow = days[1] || days[0] || {};
  var forecastDays = days.filter(function (d) {
    return d.date >= today;
  });
  return {
    temp: Math.round(cur.temperature_2m),
    feels: Math.round(cur.apparent_temperature),
    wind: Math.round(cur.wind_speed_10m),
    windDir: fmt.windDir(cur.wind_direction_10m),
    humidity: Math.round(cur.relative_humidity_2m),
    rain24: Math.round(rain24 * 10) / 10,
    code: code,
    label: labelFromCode(code),
    sky: skyFromCode(code, night),
    days: forecastDays,
    hours: hours,
    sunrise: todayRow.sunrise || "",
    sunset: todayRow.sunset || "",
    ySunrise: yestRow ? yestRow.sunrise : "",
    ySunset: yestRow ? yestRow.sunset : "",
    uv: todayRow.uv,
    max: todayRow.max,
    min: todayRow.min,
    city: CITY,
    fetchedAt: now,
  };
}

module.exports = {
  fetchWeather: fetchWeather,
  skyFromCode: skyFromCode,
  labelFromCode: labelFromCode,
  parseIsoLocal: parseIsoLocal,
  stampToMin: stampToMin,
};
