"use strict";

var http = require("./http");

var AREA = process.env.IPMA_AREA || "LIS";

function rank(level) {
  var l = String(level || "").toLowerCase();
  if (l === "red") return 3;
  if (l === "orange") return 2;
  if (l === "yellow") return 1;
  return 0;
}

function colorClass(level) {
  var r = rank(level);
  if (r >= 3) return "alert";
  if (r === 2) return "warn";
  if (r === 1) return "warn";
  return "ok";
}

async function fetchWarnings() {
  var url = "https://api.ipma.pt/open-data/forecast/warnings/warnings_www.json";
  var data = await http.getJson(url);
  var list = Array.isArray(data) ? data : [];
  var now = Date.now();
  var mine = list.filter(function (w) {
    if (String(w.idAreaAviso || "").toUpperCase() !== AREA) return false;
    var end = w.endTime ? Date.parse(w.endTime) : now;
    if (end < now) return false;
    return rank(w.awarenessLevelID) > 0;
  });
  mine.sort(function (a, b) {
    return rank(b.awarenessLevelID) - rank(a.awarenessLevelID);
  });
  var highest = mine.length ? mine[0].awarenessLevelID : "green";
  return {
    area: AREA,
    highest: highest,
    color: colorClass(highest),
    items: mine.map(function (w) {
      return {
        type: w.awarenessTypeName || "Aviso",
        level: w.awarenessLevelID,
        color: colorClass(w.awarenessLevelID),
        text: w.text || "",
        start: w.startTime,
        end: w.endTime,
      };
    }),
  };
}

module.exports = { fetchWarnings: fetchWarnings, rank: rank, colorClass: colorClass };
