"use strict";

var time = require("./time");
var assert = require("node:assert/strict");
var test = require("node:test");

test("night window 20:30-08:00 Lisbon", function () {
  var evening = time.fromLisbonParts("2026", "09", "13", "20", "29");
  var night = time.fromLisbonParts("2026", "09", "13", "20", "30");
  var late = time.fromLisbonParts("2026", "09", "14", "02", "00");
  var morning = time.fromLisbonParts("2026", "09", "14", "07", "59");
  var day = time.fromLisbonParts("2026", "09", "14", "08", "00");
  assert.equal(time.isNight(evening), false);
  assert.equal(time.isNight(night), true);
  assert.equal(time.isNight(late), true);
  assert.equal(time.isNight(morning), true);
  assert.equal(time.isNight(day), false);
});
