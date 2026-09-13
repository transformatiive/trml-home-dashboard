"use strict";

var time = require("../time");

function pad2(n) {
  n = Number(n);
  return n < 10 ? "0" + n : String(n);
}

function clip(s, max) {
  var t = String(s || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, Math.max(0, max - 1)).replace(/[,:;.\s]+$/, "") + "…";
}

function thinInt(n) {
  var sign = n < 0 ? "-" : "";
  var s = String(Math.abs(Math.round(Number(n) || 0)));
  var out = "";
  var i;
  for (i = 0; i < s.length; i++) {
    if (i && (s.length - i) % 3 === 0) out += "\u202F";
    out += s.charAt(i);
  }
  return sign + out;
}

function eurInt(n) {
  return thinInt(n) + " €";
}

function eurDec(n) {
  var v = Math.round((Number(n) || 0) * 100);
  var sign = v < 0 ? "-" : "";
  v = Math.abs(v);
  var euros = Math.floor(v / 100);
  var cents = pad2(v % 100);
  return sign + thinInt(euros) + "," + cents + " €";
}

function windDir(deg) {
  if (deg == null || isNaN(Number(deg))) return "";
  var dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  var i = Math.round((((Number(deg) % 360) + 360) % 360) / 22.5) % 16;
  return dirs[i];
}

function uvLabel(uv) {
  var n = Number(uv);
  if (isNaN(n)) return "";
  if (n < 3) return "baixo";
  if (n < 6) return "moderado";
  if (n < 8) return "alto";
  if (n < 11) return "muito alto";
  return "extremo";
}

function tempTone(t) {
  var n = Number(t);
  if (n < 18) return "slate";
  if (n <= 22) return "sage";
  return "amber";
}

function sectionTone(section) {
  var s = String(section || "").toLowerCase();
  if (s.indexOf("pol") !== -1) return "slate";
  if (s.indexOf("local") !== -1 || s.indexOf("lisboa") !== -1) return "amber";
  if (s.indexOf("econ") !== -1 || s.indexOf("ambiente") !== -1 || s.indexOf("clima") !== -1) {
    return "sage";
  }
  if (s.indexOf("socied") !== -1) return "holiday";
  return "inert";
}

function relativeAgeLisbon(date, now) {
  if (!date) return "";
  var mins = Math.round((now - date) / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return "há " + mins + " min";
  var hours = Math.round(mins / 60);
  if (hours < 24) return "há " + hours + " h";
  var p = time.parts(date);
  return p.day + "/" + p.month;
}

module.exports = {
  pad2: pad2,
  clip: clip,
  thinInt: thinInt,
  eurInt: eurInt,
  eurDec: eurDec,
  windDir: windDir,
  uvLabel: uvLabel,
  tempTone: tempTone,
  sectionTone: sectionTone,
  relativeAgeLisbon: relativeAgeLisbon,
};
