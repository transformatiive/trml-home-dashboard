"use strict";

var zlib = require("zlib");
var time = require("../time");
var fmt = require("./fmt");

var W = 928;
var H = 268;
var HORIZON = 196;
var LAT = Number(process.env.LATITUDE || "38.697");
var LON = Number(process.env.LONGITUDE || "-9.310");
var cache = {};

function crc32(buf) {
  return zlib.crc32 ? zlib.crc32(buf) : 0;
}

function chunk(tag, data) {
  var t = Buffer.from(tag);
  var len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  var crcSrc = Buffer.concat([t, data]);
  var crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcSrc) >>> 0, 0);
  return Buffer.concat([len, t, data, crc]);
}

function Canvas(width, height) {
  this.w = width;
  this.h = height;
  this.data = Buffer.alloc(width * height * 4, 0);
}

Canvas.prototype.set = function (x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
  var i = (y * this.w + x) * 4;
  this.data[i] = r;
  this.data[i + 1] = g;
  this.data[i + 2] = b;
  this.data[i + 3] = a == null ? 255 : a;
};

Canvas.prototype.fillRect = function (x, y, w, h, c) {
  var i;
  var j;
  var x0 = Math.max(0, Math.round(x));
  var y0 = Math.max(0, Math.round(y));
  var x1 = Math.min(this.w, x0 + Math.round(w));
  var y1 = Math.min(this.h, y0 + Math.round(h));
  for (j = y0; j < y1; j++) {
    for (i = x0; i < x1; i++) this.set(i, j, c[0], c[1], c[2], c[3] == null ? 255 : c[3]);
  }
};

Canvas.prototype.fillCircle = function (cx, cy, r, c) {
  var x;
  var y;
  var r2 = r * r;
  cx = Math.round(cx);
  cy = Math.round(cy);
  for (y = cy - r; y <= cy + r; y++) {
    for (x = cx - r; x <= cx + r; x++) {
      var dx = x - cx;
      var dy = y - cy;
      if (dx * dx + dy * dy <= r2) this.set(x, y, c[0], c[1], c[2], c[3] == null ? 255 : c[3]);
    }
  }
};

Canvas.prototype.png = function () {
  var raw = [];
  var y;
  var x;
  for (y = 0; y < this.h; y++) {
    raw.push(0);
    for (x = 0; x < this.w; x++) {
      var i = (y * this.w + x) * 4;
      raw.push(this.data[i], this.data[i + 1], this.data[i + 2], this.data[i + 3]);
    }
  }
  var ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(this.w, 0);
  ihdr.writeUInt32BE(this.h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(Buffer.from(raw))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
};

function hex(h) {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), 255];
}

var THEMES = {
  day: {
    night: hex("#D8D2C4"),
    twilight: hex("#E3D9C6"),
    day: hex("#EFEADF"),
    gold: hex("#E8D9B8"),
    curve: hex("#C4A35A"),
    disk: hex("#D4A017"),
    moon: hex("#8A8478"),
    ink: hex("#1C1914"),
    muted: hex("#7A7468"),
    bg: hex("#F4F1EA"),
  },
  night: {
    night: hex("#100E0C"),
    twilight: hex("#231F1A"),
    day: hex("#1E1B18"),
    gold: hex("#2E2820"),
    curve: hex("#C4A35A"),
    disk: hex("#D4A017"),
    moon: hex("#8FA3B5"),
    ink: hex("#F3EFE6"),
    muted: hex("#9A9388"),
    bg: hex("#161412"),
  },
};

function toJulian(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function solarPosition(jd) {
  var n = jd - 2451545.0;
  var L = ((280.46 + 0.9856474 * n) % 360 + 360) % 360;
  var g = ((((357.528 + 0.9856003 * n) % 360) + 360) % 360) * Math.PI / 180;
  var lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * Math.PI / 180;
  var epsilon = (23.439 - 0.0000004 * n) * Math.PI / 180;
  var dec = Math.asin(Math.sin(epsilon) * Math.sin(lambda));
  var ra = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda));
  var eot = (L * Math.PI / 180 - ra) * 4 * (180 / Math.PI);
  if (eot > 720) eot -= 1440;
  if (eot < -720) eot += 1440;
  return { dec: dec, eot: eot };
}

function hourAngleHours(lat, dec, elevDeg) {
  var phi = lat * Math.PI / 180;
  var alpha = elevDeg * Math.PI / 180;
  var cosH = (Math.sin(alpha) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec));
  if (cosH > 1) return 0;
  if (cosH < -1) return 12;
  return (Math.acos(cosH) * 180) / Math.PI / 15;
}

function solarTimes(date, lat, lon) {
  lat = lat == null ? LAT : lat;
  lon = lon == null ? LON : lon;
  var p = time.parts(date);
  var localNoon = time.fromLisbonParts(p.year, p.month, p.day, "12", "00");
  var jd = toJulian(localNoon);
  var pos = solarPosition(jd);
  var noonUtc = 12 - lon / 15 - pos.eot / 60;
  var haRise = hourAngleHours(lat, pos.dec, -0.833);
  var haCivil = hourAngleHours(lat, pos.dec, -6);
  function mins(utcH) {
    var d = new Date(Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), 0, 0, 0) + utcH * 3600000);
    return time.minutesOfDay(d);
  }
  var rise = mins(noonUtc - haRise);
  var set = mins(noonUtc + haRise);
  var dawn = mins(noonUtc - haCivil);
  var dusk = mins(noonUtc + haCivil);
  if (set <= rise) set += 24 * 60;
  if (dusk <= dawn) dusk += 24 * 60;
  return {
    rise: rise,
    set: set,
    dawn: dawn,
    dusk: dusk,
    zenith: Math.round((rise + set) / 2),
    dayLen: set - rise,
    civilMinutes: (haCivil - haRise) * 60,
  };
}

function xFromMin(min) {
  var h = min / 60;
  return Math.round(((h - 4) / 19) * W);
}

function yOnQuad(t, y0, y1, yc) {
  var u = 1 - t;
  return u * u * y0 + 2 * u * t * yc + t * t * y1;
}

function xOnQuad(t, x0, x1, xc) {
  var u = 1 - t;
  return u * u * x0 + 2 * u * t * xc + t * t * x1;
}

function dayCurvePoint(t, xRise, xSet) {
  var xZ = Math.round((xRise + xSet) / 2);
  return {
    x: Math.round(xOnQuad(t, xRise, xSet, xZ)),
    y: Math.round(yOnQuad(t, HORIZON, HORIZON, -100)),
  };
}

function tForNow(nowMin, rise, set) {
  if (set <= rise) return 0;
  return Math.max(0, Math.min(1, (nowMin - rise) / (set - rise)));
}

function moonInfo(date) {
  var known = Date.UTC(2000, 0, 6, 18, 14, 0);
  var syn = 29.53058867;
  var age = ((date.getTime() - known) / 86400000) % syn;
  if (age < 0) age += syn;
  var illum = Math.round(((1 - Math.cos((2 * Math.PI * age) / syn)) / 2) * 100);
  var shiftMin = Math.round((age / syn) * 24.8 * 60);
  var times = solarTimes(date);
  var rise = (times.rise + shiftMin) % (24 * 60);
  return { pct: illum, rise: rise };
}

function labelTime(min) {
  var m = ((min % (24 * 60)) + 24 * 60) % (24 * 60);
  return fmt.pad2(Math.floor(m / 60)) + ":" + fmt.pad2(m % 60);
}

var FONT = {
  "0": ["111", "101", "101", "101", "111"],
  "1": ["010", "110", "010", "010", "111"],
  "2": ["111", "001", "111", "100", "111"],
  "3": ["111", "001", "111", "001", "111"],
  "4": ["101", "101", "111", "001", "001"],
  "5": ["111", "100", "111", "001", "111"],
  "6": ["111", "100", "111", "101", "111"],
  "7": ["111", "001", "010", "010", "010"],
  "8": ["111", "101", "111", "101", "111"],
  "9": ["111", "101", "111", "001", "111"],
  ":": ["0", "1", "0", "1", "0"],
  "%": ["101", "001", "010", "100", "101"],
  ".": ["0", "0", "0", "0", "1"],
  " ": ["0", "0", "0", "0", "0"],
  "·": ["0", "0", "1", "0", "0"],
  "-": ["00", "00", "11", "00", "00"],
  a: ["000", "011", "101", "101", "011"],
  c: ["000", "011", "100", "100", "011"],
  d: ["001", "001", "011", "101", "011"],
  e: ["000", "010", "111", "100", "011"],
  f: ["011", "100", "110", "100", "100"],
  g: ["000", "011", "101", "001", "110"],
  h: ["100", "100", "111", "101", "101"],
  i: ["1", "0", "1", "1", "1"],
  l: ["1", "1", "1", "1", "1"],
  m: ["00000", "11111", "10101", "10101", "10101"],
  n: ["000", "110", "101", "101", "101"],
  o: ["000", "010", "101", "101", "010"],
  p: ["000", "110", "101", "110", "100"],
  r: ["000", "011", "100", "100", "100"],
  s: ["000", "011", "110", "001", "110"],
  t: ["010", "111", "010", "010", "001"],
  u: ["000", "101", "101", "101", "011"],
  x: ["000", "101", "010", "101", "000"],
  z: ["000", "111", "001", "010", "111"],
  é: ["010", "010", "111", "100", "011"],
  ô: ["010", "010", "101", "101", "010"],
};

FONT.A = ["010", "101", "111", "101", "101"];
FONT.N = ["101", "111", "111", "101", "101"];
FONT.O = ["010", "101", "101", "101", "010"];
FONT.I = ["111", "010", "010", "010", "111"];
FONT.T = ["111", "010", "010", "010", "010"];
FONT.E = ["111", "100", "111", "100", "111"];

function drawText(c, x, y, text, color, scale) {
  scale = scale || 2;
  var cx = x;
  var i;
  var row;
  var col;
  var ch;
  var glyph;
  var s = String(text || "");
  for (i = 0; i < s.length; i++) {
    ch = s.charAt(i);
    glyph = FONT[ch] || FONT[ch.toLowerCase()] || FONT[" "];
    var gw = glyph[0].length;
    for (row = 0; row < glyph.length; row++) {
      for (col = 0; col < gw; col++) {
        if (glyph[row].charAt(col) === "1") {
          c.fillRect(cx + col * scale, y + row * scale, scale, scale, color);
        }
      }
    }
    cx += (gw + 1) * scale;
  }
  return cx;
}

function strokeQuad(c, x0, y0, x1, y1, xc, yc, color, thick, dashed) {
  var t;
  var prev = null;
  var on = true;
  var acc = 0;
  for (t = 0; t <= 1.001; t += 0.004) {
    var x = Math.round(xOnQuad(t, x0, x1, xc));
    var y = Math.round(yOnQuad(t, y0, y1, yc));
    if (prev) {
      var dx = x - prev.x;
      var dy = y - prev.y;
      acc += Math.sqrt(dx * dx + dy * dy);
      if (dashed && acc > 7) {
        on = !on;
        acc = 0;
      }
      if (on) c.fillRect(x - Math.floor(thick / 2), y - Math.floor(thick / 2), thick, thick, color);
    }
    prev = { x: x, y: y };
  }
}

function parseQueryTime(d, t) {
  var dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || "");
  var now = time.lisbonNow();
  if (!dm) dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(time.ymd(now));
  var hhmm = /^(\d{2})(\d{2})$/.exec(t || "");
  if (!hhmm) {
    var hm = time.hourMinute(now);
    hhmm = [null, fmt.pad2(hm.hour), fmt.pad2(hm.minute)];
  }
  var date = time.fromLisbonParts(dm[1], dm[2], dm[3], hhmm[1], hhmm[2]);
  var min = Number(hhmm[1]) * 60 + Number(hhmm[2]);
  min = Math.floor(min / 5) * 5;
  return { date: date, min: min, ymd: dm[1] + "-" + dm[2] + "-" + dm[3], hhmm: fmt.pad2(Math.floor(min / 60)) + fmt.pad2(min % 60) };
}

function cacheKey(ymd, hhmm, theme) {
  return ymd + "|" + hhmm + "|" + theme;
}

function renderPng(opts) {
  opts = opts || {};
  var themeName = opts.theme === "night" ? "night" : "day";
  var parsed = parseQueryTime(opts.d, opts.t);
  var key = cacheKey(parsed.ymd, parsed.hhmm, themeName);
  if (cache[key]) return cache[key];
  var pal = THEMES[themeName];
  var times = opts.times || solarTimes(parsed.date);
  var nowMin = parsed.min;
  var xDawn = xFromMin(times.dawn);
  var xRise = xFromMin(times.rise);
  var xSet = xFromMin(times.set);
  var xDusk = xFromMin(times.dusk);
  var xNow = xFromMin(nowMin);
  var c = new Canvas(W, H);
  c.fillRect(0, 0, W, H, pal.bg);
  c.fillRect(0, 0, xDawn, HORIZON, pal.night);
  c.fillRect(xDawn, 0, Math.max(1, xRise - xDawn), HORIZON, pal.twilight);
  c.fillRect(xRise, 0, Math.max(1, xSet - xRise), HORIZON, pal.day);
  c.fillRect(xSet, 0, Math.max(1, xDusk - xSet), HORIZON, pal.twilight);
  c.fillRect(xDusk, 0, Math.max(1, W - xDusk), HORIZON, pal.night);
  var goldW = xFromMin(times.rise + 45) - xRise;
  if (goldW < 8) goldW = 36;
  c.fillRect(xRise, 0, goldW, HORIZON, pal.gold);
  c.fillRect(xSet - goldW, 0, goldW, HORIZON, pal.gold);
  c.fillRect(0, HORIZON, W, 1, pal.muted);
  var xZ = Math.round((xRise + xSet) / 2);
  strokeQuad(c, xRise, HORIZON, xSet, HORIZON, xZ, -100, pal.curve, 3, false);
  strokeQuad(c, xRise, HORIZON, 0, 250, Math.round(xRise / 2), 240, pal.curve, 2, true);
  strokeQuad(c, xSet, HORIZON, W, 250, Math.round((xSet + W) / 2), 240, pal.curve, 2, true);
  var moon = moonInfo(parsed.date);
  var moonX = nowMin < times.rise ? Math.max(40, xDawn - 40) : Math.min(W - 40, xDusk + 40);
  var moonY = 70;
  c.fillCircle(moonX, moonY, 13, pal.moon);
  c.fillCircle(moonX + 7, moonY - 3, 13, pal.night);
  var stars = [
    [moonX - 28, 36],
    [moonX + 22, 44],
    [moonX - 12, 22],
    [28, 48],
    [W - 36, 30],
  ];
  stars.forEach(function (s) {
    c.fillRect(s[0], s[1], 2, 2, pal.moon);
  });
  var pt;
  if (nowMin >= times.rise && nowMin <= times.set) {
    pt = dayCurvePoint(tForNow(nowMin, times.rise, times.set), xRise, xSet);
  } else if (nowMin < times.rise) {
    var tN = Math.max(0, Math.min(1, (4 * 60 - nowMin) === 0 ? 1 : (times.rise - nowMin) / Math.max(1, times.rise - 4 * 60)));
    pt = {
      x: Math.round(xOnQuad(1 - tN, xRise, 0, Math.round(xRise / 2))),
      y: Math.round(yOnQuad(1 - tN, HORIZON, 250, 240)),
    };
  } else {
    var tE = Math.max(0, Math.min(1, (nowMin - times.set) / Math.max(1, 23 * 60 - times.set)));
    pt = {
      x: Math.round(xOnQuad(tE, xSet, W, Math.round((xSet + W) / 2))),
      y: Math.round(yOnQuad(tE, HORIZON, 250, 240)),
    };
  }
  var dashY;
  for (dashY = pt.y; dashY < HORIZON; dashY += 6) {
    c.fillRect(pt.x, dashY, 1, 3, pal.disk);
  }
  c.fillCircle(pt.x, pt.y, 14, pal.disk);
  var i;
  for (i = 0; i < 8; i++) {
    var a = (i * Math.PI) / 4;
    var x1 = Math.round(pt.x + Math.cos(a) * 16);
    var y1 = Math.round(pt.y + Math.sin(a) * 16);
    var x2 = Math.round(pt.x + Math.cos(a) * 26);
    var y2 = Math.round(pt.y + Math.sin(a) * 26);
    strokeQuad(c, x1, y1, x2, y2, x1, y1, pal.disk, 3, false);
  }
  drawText(c, pt.x - 24, Math.max(8, pt.y - 28), labelTime(nowMin), pal.ink, 3);
  drawText(c, Math.max(8, xRise - 20), HORIZON + 8, "nascer", pal.muted, 2);
  drawText(c, Math.min(W - 80, xSet - 10), HORIZON + 8, "por", pal.muted, 2);
  drawText(c, 12, 12, "noite", pal.muted, 2);
  drawText(c, xRise + 8, 12, "gold", pal.muted, 2);
  drawText(c, xZ - 20, 20, "zenite", pal.muted, 2);
  var elapsed = 0;
  if (nowMin >= times.rise && nowMin <= times.set) {
    elapsed = Math.round(((nowMin - times.rise) / times.dayLen) * 100);
  } else if (nowMin > times.set) elapsed = 100;
  var left = Math.max(0, times.set - nowMin);
  var legend =
    elapsed +
    " % do dia decorrido · faltam " +
    Math.floor(left / 60) +
    " h " +
    (left % 60) +
    " min de luz";
  drawText(c, 12, H - 18, legend, pal.muted, 2);
  var png = c.png();
  cache[key] = png;
  var keys = Object.keys(cache);
  if (keys.length > 48) delete cache[keys[0]];
  return png;
}

function statusLine(nowMin, times) {
  if (nowMin < times.rise) return "ainda noite · nasce às " + labelTime(times.rise);
  if (nowMin > times.set) return "já noite · pôs-se às " + labelTime(times.set);
  var left = times.set - nowMin;
  return "dia · pôr-do-sol daqui a " + Math.floor(left / 60) + " h " + (left % 60) + " min";
}

function durationDelta(today, yesterday) {
  var d = today.dayLen - yesterday.dayLen;
  var sign = d < 0 ? "−" : "+";
  var abs = Math.abs(d);
  var sec = Math.round((abs % 1) * 60);
  var min = Math.floor(abs);
  return {
    text: sign + min + " min" + (sec ? " " + fmt.pad2(sec) + " s" : "") + " que ontem",
    negative: d < 0,
  };
}

module.exports = {
  W: W,
  H: H,
  HORIZON: HORIZON,
  xFromMin: xFromMin,
  solarTimes: solarTimes,
  moonInfo: moonInfo,
  renderPng: renderPng,
  cacheKey: cacheKey,
  parseQueryTime: parseQueryTime,
  statusLine: statusLine,
  durationDelta: durationDelta,
  labelTime: labelTime,
  dayCurvePoint: dayCurvePoint,
  tForNow: tForNow,
};
