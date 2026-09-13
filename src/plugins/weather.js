'use strict';

var LISBON = { lat: 38.7223, lon: -9.1393 };

var WMO = {
  0: { label: 'Céu limpo', kind: 'clear' },
  1: { label: 'Quase limpo', kind: 'clear' },
  2: { label: 'Parcialmente nublado', kind: 'cloud' },
  3: { label: 'Nublado', kind: 'cloud' },
  45: { label: 'Nevoeiro', kind: 'fog' },
  48: { label: 'Nevoeiro gelado', kind: 'fog' },
  51: { label: 'Chuvisco fraco', kind: 'rain' },
  53: { label: 'Chuvisco', kind: 'rain' },
  55: { label: 'Chuvisco forte', kind: 'rain' },
  61: { label: 'Chuva fraca', kind: 'rain' },
  63: { label: 'Chuva', kind: 'rain' },
  65: { label: 'Chuva forte', kind: 'rain' },
  71: { label: 'Neve fraca', kind: 'snow' },
  73: { label: 'Neve', kind: 'snow' },
  75: { label: 'Neve forte', kind: 'snow' },
  80: { label: 'Aguaceiros', kind: 'rain' },
  81: { label: 'Aguaceiros', kind: 'rain' },
  82: { label: 'Aguaceiros fortes', kind: 'rain' },
  95: { label: 'Trovoada', kind: 'storm' },
  96: { label: 'Trovoada com granizo', kind: 'storm' },
  99: { label: 'Trovoada com granizo', kind: 'storm' }
};

function describe(code) {
  return WMO[code] || { label: 'Céu variável', kind: 'cloud' };
}

function load() {
  var url =
    'https://api.open-meteo.com/v1/forecast?latitude=' +
    LISBON.lat +
    '&longitude=' +
    LISBON.lon +
    '&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,is_day' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
    '&timezone=Europe%2FLisbon&forecast_days=4';
  return fetch(url).then(function (res) {
    if (!res.ok) throw new Error('weather-http');
    return res.json();
  }).then(function (data) {
    var cur = data.current || {};
    var daily = data.daily || {};
    var days = [];
    var i;
    var times = daily.time || [];
    for (i = 0; i < times.length; i++) {
      days.push({
        date: times[i],
        code: daily.weather_code[i],
        max: daily.temperature_2m_max[i],
        min: daily.temperature_2m_min[i],
        rain: daily.precipitation_probability_max[i],
        meta: describe(daily.weather_code[i])
      });
    }
    return {
      ok: true,
      temp: cur.temperature_2m,
      wind: cur.wind_speed_10m,
      humidity: cur.relative_humidity_2m,
      isDay: cur.is_day === 1,
      code: cur.weather_code,
      meta: describe(cur.weather_code),
      days: days
    };
  }).catch(function () {
    return { ok: false };
  });
}

module.exports = { load: load, describe: describe };
