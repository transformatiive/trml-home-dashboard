"use strict";

var http = require("./http");

var LAT = process.env.LATITUDE || "38.7223";
var LON = process.env.LONGITUDE || "-9.1393";

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

async function fetchWeather() {
  var url =
    "https://api.open-meteo.com/v1/forecast?latitude=" +
    encodeURIComponent(LAT) +
    "&longitude=" +
    encodeURIComponent(LON) +
    "&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,apparent_temperature" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
    "&timezone=Europe%2FLisbon&forecast_days=3";
  var data = await http.getJson(url);
  var cur = data.current || {};
  var daily = data.daily || {};
  var code = Number(cur.weather_code || 0);
  var days = [];
  var i;
  for (i = 0; i < (daily.time || []).length; i++) {
    days.push({
      date: daily.time[i],
      code: Number(daily.weather_code[i]),
      label: labelFromCode(Number(daily.weather_code[i])),
      max: Math.round(daily.temperature_2m_max[i]),
      min: Math.round(daily.temperature_2m_min[i]),
    });
  }
  return {
    temp: Math.round(cur.temperature_2m),
    feels: Math.round(cur.apparent_temperature),
    wind: Math.round(cur.wind_speed_10m),
    humidity: Math.round(cur.relative_humidity_2m),
    code: code,
    label: labelFromCode(code),
    sky: skyFromCode(code, false),
    days: days,
    city: "Lisboa",
  };
}

module.exports = {
  fetchWeather: fetchWeather,
  skyFromCode: skyFromCode,
  labelFromCode: labelFromCode,
};
