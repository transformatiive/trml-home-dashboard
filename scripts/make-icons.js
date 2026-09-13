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

function makePng(size, out) {
  var raw = [];
  var y;
  var x;
  var cx = (size - 1) / 2;
  var cy = (size - 1) / 2;
  var r = size * 0.36;
  for (y = 0; y < size; y++) {
    raw.push(0);
    for (x = 0; x < size; x++) {
      var dx = x - cx;
      var dy = y - cy;
      var inside = dx * dx + dy * dy <= r * r;
      if (inside) {
        raw.push(234, 220, 200, 255);
      } else {
        raw.push(36, 32, 28, 255);
      }
    }
  }
  var data = Buffer.from(raw);
  var ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  var png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(data)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, png);
}

var dir = path.join(__dirname, "..", "public", "icons");
makePng(57, path.join(dir, "apple-touch-icon-57.png"));
makePng(72, path.join(dir, "apple-touch-icon-72.png"));
