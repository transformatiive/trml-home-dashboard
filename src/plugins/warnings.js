'use strict';

var AREA = 'LSB';

function rank(level) {
  var id = String(level || 'green').toLowerCase();
  if (id === 'red') return 3;
  if (id === 'orange') return 2;
  if (id === 'yellow') return 1;
  return 0;
}

function load() {
  return fetch('https://api.ipma.pt/open-data/forecast/warnings/warnings_www.json', {
    headers: { 'User-Agent': 'trml-home-dashboard/1' }
  }).then(function (res) {
    if (!res.ok) throw new Error('ipma-http');
    return res.json();
  }).then(function (rows) {
    var now = Date.now();
    var list = (rows || []).filter(function (row) {
      if (row.idAreaAviso !== AREA) return false;
      var end = row.endTime ? Date.parse(row.endTime) : now + 1;
      return end >= now;
    });
    list.sort(function (a, b) {
      return rank(b.awarenessLevelID) - rank(a.awarenessLevelID);
    });
    var worst = 0;
    list.forEach(function (row) {
      var r = rank(row.awarenessLevelID);
      if (r > worst) worst = r;
    });
    return { ok: true, items: list, worst: worst };
  }).catch(function () {
    return { ok: false, items: [], worst: 0 };
  });
}

module.exports = { load: load, rank: rank };
