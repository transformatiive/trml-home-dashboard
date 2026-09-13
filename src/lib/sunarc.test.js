"use strict";

var sunarc = require("./sunarc");
var assert = require("node:assert/strict");
var test = require("node:test");
var time = require("../time");

test("x mapping 04:00-23:00 onto 928", function () {
  assert.equal(sunarc.xFromMin(4 * 60), 0);
  assert.equal(sunarc.xFromMin(23 * 60), 928);
  var mid = sunarc.xFromMin((4 + 23) / 2 * 60);
  assert.ok(Math.abs(mid - 464) < 2);
});

test("civil twilight uses solar elevation, not a fixed +27 minutes", function () {
  var june = time.fromLisbonParts("2026", "06", "21", "12", "00");
  var dec = time.fromLisbonParts("2026", "12", "21", "12", "00");
  var tJ = sunarc.solarTimes(june, 38.697, -9.31);
  var tD = sunarc.solarTimes(dec, 38.697, -9.31);
  assert.ok(tJ.civilMinutes > 20 && tJ.civilMinutes < 45);
  assert.ok(tD.civilMinutes > 20 && tD.civilMinutes < 45);
  assert.ok(Math.abs(tJ.civilMinutes - tD.civilMinutes) > 0.4);
});

test("PNG is 928x268 with signature", function () {
  var png = sunarc.renderPng({ d: "2026-09-13", t: "0840", theme: "day" });
  assert.equal(png[0], 137);
  assert.equal(png[1], 80);
  assert.equal(png[2], 78);
  assert.equal(png[3], 71);
  var width = png.readUInt32BE(16);
  var height = png.readUInt32BE(20);
  assert.equal(width, 928);
  assert.equal(height, 268);
});

test("quadratic apex sits near y=48", function () {
  var p = sunarc.dayCurvePoint(0.5, 100, 800);
  assert.ok(Math.abs(p.y - 48) < 2);
});