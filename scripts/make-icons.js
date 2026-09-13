"use strict";

var fs = require("fs");
var path = require("path");
var zlib = require("zlib");

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

function Canvas(size) {
  this.size = size;
  this.data = Buffer.alloc(size * size * 4, 0);
}

Canvas.prototype.set = function (x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= this.size || y >= this.size) return;
  var i = (y * this.size + x) * 4;
  this.data[i] = r;
  this.data[i + 1] = g;
  this.data[i + 2] = b;
  this.data[i + 3] = a == null ? 255 : a;
};

Canvas.prototype.fillRect = function (x, y, w, h, c) {
  var i;
  var j;
  for (j = 0; j < h; j++) {
    for (i = 0; i < w; i++) this.set(x + i, y + j, c[0], c[1], c[2], c[3]);
  }
};

Canvas.prototype.fillCircle = function (cx, cy, r, c) {
  var x;
  var y;
  var r2 = r * r;
  for (y = Math.floor(cy - r); y <= cy + r; y++) {
    for (x = Math.floor(cx - r); x <= cx + r; x++) {
      var dx = x - cx;
      var dy = y - cy;
      if (dx * dx + dy * dy <= r2) this.set(x, y, c[0], c[1], c[2], c[3]);
    }
  }
};

Canvas.prototype.line = function (x0, y0, x1, y1, c, thick) {
  var dx = Math.abs(x1 - x0);
  var dy = Math.abs(y1 - y0);
  var sx = x0 < x1 ? 1 : -1;
  var sy = y0 < y1 ? 1 : -1;
  var err = dx - dy;
  var t = thick || 2;
  while (true) {
    this.fillRect(x0 - Math.floor(t / 2), y0 - Math.floor(t / 2), t, t, c);
    if (x0 === x1 && y0 === y1) break;
    var e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
};

Canvas.prototype.png = function () {
  var size = this.size;
  var raw = [];
  var y;
  var x;
  for (y = 0; y < size; y++) {
    raw.push(0);
    for (x = 0; x < size; x++) {
      var i = (y * size + x) * 4;
      raw.push(this.data[i], this.data[i + 1], this.data[i + 2], this.data[i + 3]);
    }
  }
  var ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
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

function writePng(canvas, file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, canvas.png());
}

var YEL = [245, 186, 24, 255];
var BLU = [37, 99, 235, 255];
var SKY = [56, 189, 248, 255];
var GRN = [22, 163, 74, 255];
var ORG = [217, 119, 6, 255];
var RED = [220, 38, 38, 255];
var GRY = [107, 114, 128, 255];
var LTG = [209, 213, 219, 255];
var WHT = [255, 255, 255, 255];
var INK = [23, 23, 23, 255];
var PPL = [124, 58, 237, 255];

function wxSun(c) {
  var s = c.size;
  var cx = (s - 1) / 2;
  var cy = (s - 1) / 2;
  var i;
  for (i = 0; i < 8; i++) {
    var a = (i * Math.PI) / 4;
    c.line(
      Math.round(cx + Math.cos(a) * 14),
      Math.round(cy + Math.sin(a) * 14),
      Math.round(cx + Math.cos(a) * 21),
      Math.round(cy + Math.sin(a) * 21),
      YEL,
      3
    );
  }
  c.fillCircle(cx, cy, 10, YEL);
}

function wxMoon(c) {
  var s = c.size;
  var cx = (s - 1) / 2;
  c.fillCircle(cx, cx, 14, LTG);
  c.fillCircle(cx + 6, cx - 4, 11, [0, 0, 0, 0]);
  var x;
  var y;
  for (y = 0; y < s; y++) {
    for (x = 0; x < s; x++) {
      var i = (y * s + x) * 4;
      if (c.data[i + 3] === 0) continue;
    }
  }
  c.fillCircle(cx + 7, cx - 5, 11, [0, 0, 0, 1]);
}

function punch(c, fn) {
  var tmp = new Canvas(c.size);
  fn(tmp);
  var i;
  for (i = 0; i < tmp.data.length; i += 4) {
    if (tmp.data[i + 3] > 10) {
      c.data[i] = 0;
      c.data[i + 1] = 0;
      c.data[i + 2] = 0;
      c.data[i + 3] = 0;
    }
  }
}

function wxMoon2(c) {
  var cx = (c.size - 1) / 2;
  c.fillCircle(cx - 1, cx, 14, LTG);
  punch(c, function (t) {
    t.fillCircle(cx + 7, cx - 4, 12, WHT);
  });
}

function cloud(c, ox, oy, col) {
  c.fillCircle(18 + ox, 24 + oy, 8, col);
  c.fillCircle(28 + ox, 22 + oy, 10, col);
  c.fillCircle(36 + ox, 25 + oy, 7, col);
  c.fillRect(18 + ox, 24 + oy, 18, 10, col);
}

function wxCloud(c) {
  cloud(c, 0, 2, GRY);
}

function wxPartly(c) {
  c.fillCircle(16, 16, 8, YEL);
  c.line(16, 4, 16, 7, YEL, 2);
  c.line(27, 16, 30, 16, YEL, 2);
  cloud(c, 2, 6, GRY);
}

function wxRain(c) {
  cloud(c, 0, -4, GRY);
  c.line(16, 34, 14, 42, SKY, 3);
  c.line(24, 34, 22, 42, SKY, 3);
  c.line(32, 34, 30, 42, SKY, 3);
}

function wxStorm(c) {
  cloud(c, 0, -6, GRY);
  c.fillRect(26, 28, 5, 8, YEL);
  c.fillRect(22, 34, 10, 4, YEL);
  c.fillRect(20, 38, 5, 8, YEL);
}

function wxFog(c) {
  c.fillRect(8, 16, 32, 4, LTG);
  c.fillRect(10, 24, 28, 4, GRY);
  c.fillRect(8, 32, 32, 4, LTG);
}

function iconClock(c) {
  c.fillCircle(24, 24, 18, INK);
  c.fillCircle(24, 24, 14, WHT);
  c.line(24, 24, 24, 14, INK, 2);
  c.line(24, 24, 32, 28, INK, 2);
  c.fillCircle(24, 24, 2, INK);
}

function iconCal(c) {
  c.fillRect(8, 12, 32, 26, BLU);
  c.fillRect(8, 12, 32, 8, INK);
  c.fillRect(14, 8, 4, 8, INK);
  c.fillRect(30, 8, 4, 8, INK);
  c.fillRect(14, 24, 6, 6, WHT);
  c.fillRect(24, 24, 6, 6, WHT);
  c.fillRect(14, 32, 6, 4, WHT);
}

function iconWork(c) {
  c.fillRect(10, 18, 28, 18, BLU);
  c.fillRect(18, 14, 12, 6, INK);
  c.fillRect(8, 22, 32, 4, INK);
}

function iconHome(c) {
  c.fillRect(14, 24, 20, 16, GRN);
  var x;
  for (x = 0; x < 16; x++) {
    c.line(24, 10, 8 + x * 2, 26, GRN, 2);
  }
  c.fillRect(20, 30, 8, 10, INK);
}

function iconFamily(c) {
  c.fillCircle(18, 16, 6, ORG);
  c.fillCircle(30, 18, 5, YEL);
  c.fillRect(12, 24, 12, 14, ORG);
  c.fillRect(24, 26, 12, 12, YEL);
}

function iconHoliday(c) {
  c.fillRect(22, 8, 4, 32, ORG);
  c.fillRect(14, 10, 20, 14, RED);
  c.fillRect(14, 10, 8, 14, WHT);
}

function iconMail(c) {
  c.fillRect(8, 14, 32, 22, BLU);
  c.line(8, 14, 24, 26, WHT, 2);
  c.line(40, 14, 24, 26, WHT, 2);
}

function iconPeople(c) {
  c.fillCircle(24, 16, 7, PPL);
  c.fillRect(14, 26, 20, 14, PPL);
  c.fillCircle(24, 26, 10, PPL);
}

function iconNoise(c) {
  c.fillRect(10, 20, 8, 12, GRY);
  c.fillRect(18, 14, 6, 24, GRY);
  c.fillRect(26, 10, 6, 28, LTG);
  c.fillRect(34, 16, 6, 16, GRY);
}

function iconWarn(c) {
  var x;
  var y;
  for (y = 8; y < 40; y++) {
    var w = Math.round(((y - 8) / 32) * 18);
    c.fillRect(24 - w, y, w * 2 + 1, 1, YEL);
  }
  c.fillRect(22, 18, 4, 12, INK);
  c.fillRect(22, 32, 4, 4, INK);
}

function iconOk(c) {
  c.fillCircle(24, 24, 16, GRN);
  c.line(14, 24, 21, 32, WHT, 3);
  c.line(21, 32, 34, 16, WHT, 3);
}

function iconNews(c) {
  c.fillRect(10, 8, 28, 32, INK);
  c.fillRect(14, 12, 20, 4, WHT);
  c.fillRect(14, 20, 16, 3, LTG);
  c.fillRect(14, 26, 16, 3, LTG);
  c.fillRect(14, 32, 12, 3, LTG);
}

function iconYear(c) {
  c.fillCircle(24, 24, 16, INK);
  c.fillCircle(24, 24, 12, WHT);
  c.fillRect(22, 12, 4, 14, INK);
  c.fillRect(22, 24, 12, 4, INK);
}

function iconWind(c) {
  c.line(8, 16, 36, 16, SKY, 3);
  c.line(8, 24, 40, 24, SKY, 3);
  c.line(8, 32, 32, 32, SKY, 3);
}

function iconDrop(c) {
  c.fillCircle(24, 28, 10, SKY);
  var y;
  for (y = 8; y < 22; y++) {
    var w = Math.round(((y - 8) / 14) * 8);
    c.fillRect(24 - w, y, w * 2 + 1, 1, SKY);
  }
}

function iconPin(c) {
  c.fillCircle(24, 18, 10, RED);
  c.fillCircle(24, 18, 4, WHT);
  c.line(24, 26, 24, 40, RED, 4);
}

function iconDot(c) {
  c.fillCircle(24, 24, 8, BLU);
}

function iconBolt(c) {
  c.fillRect(26, 8, 6, 14, YEL);
  c.fillRect(18, 20, 16, 6, YEL);
  c.fillRect(16, 24, 6, 16, YEL);
}

function iconEuro(c) {
  c.fillCircle(24, 24, 16, INK);
  c.fillCircle(24, 24, 12, WHT);
  c.fillRect(14, 18, 16, 3, INK);
  c.fillRect(14, 26, 16, 3, INK);
  c.fillRect(18, 12, 4, 24, INK);
}

function iconChart(c) {
  c.fillRect(10, 28, 6, 12, BLU);
  c.fillRect(20, 18, 6, 22, GRN);
  c.fillRect(30, 12, 6, 28, YEL);
  c.line(8, 40, 40, 40, INK, 2);
}

function iconAi(c) {
  c.fillCircle(24, 22, 10, PPL);
  c.fillRect(20, 30, 8, 8, PPL);
  c.fillRect(16, 12, 3, 6, PPL);
  c.fillRect(29, 12, 3, 6, PPL);
  c.fillRect(10, 20, 6, 3, PPL);
  c.fillRect(32, 20, 6, 3, PPL);
}

var glyphs = {
  "wx-sun": wxSun,
  "wx-moon": wxMoon2,
  "wx-partly": wxPartly,
  "wx-cloud": wxCloud,
  "wx-rain": wxRain,
  "wx-storm": wxStorm,
  "wx-fog": wxFog,
  "icon-clock": iconClock,
  "icon-cal": iconCal,
  "icon-work": iconWork,
  "icon-home": iconHome,
  "icon-family": iconFamily,
  "icon-holiday": iconHoliday,
  "icon-mail": iconMail,
  "icon-people": iconPeople,
  "icon-noise": iconNoise,
  "icon-warn": iconWarn,
  "icon-ok": iconOk,
  "icon-news": iconNews,
  "icon-year": iconYear,
  "icon-wind": iconWind,
  "icon-drop": iconDrop,
  "icon-pin": iconPin,
  "icon-dot": iconDot,
  "icon-bolt": iconBolt,
  "icon-euro": iconEuro,
  "icon-chart": iconChart,
  "icon-ai": iconAi,
};

function appleTouch(size, file) {
  var c = new Canvas(size);
  var bg = [242, 242, 239, 255];
  c.fillRect(0, 0, size, size, bg);
  var scale = size / 48;
  var inner = new Canvas(48);
  wxSun(inner);
  var x;
  var y;
  for (y = 0; y < 48; y++) {
    for (x = 0; x < 48; x++) {
      var i = (y * 48 + x) * 4;
      if (inner.data[i + 3] < 10) continue;
      var dx = Math.round(x * scale);
      var dy = Math.round(y * scale);
      c.set(dx, dy, inner.data[i], inner.data[i + 1], inner.data[i + 2], 255);
    }
  }
  writePng(c, file);
}

var dir = path.join(__dirname, "..", "public", "icons");
Object.keys(glyphs).forEach(function (name) {
  var c = new Canvas(48);
  glyphs[name](c);
  writePng(c, path.join(dir, name + ".png"));
});
appleTouch(57, path.join(dir, "apple-touch-icon-57.png"));
appleTouch(72, path.join(dir, "apple-touch-icon-72.png"));
