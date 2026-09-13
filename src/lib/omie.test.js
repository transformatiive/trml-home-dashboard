"use strict";

var omie = require("./omie");
var assert = require("node:assert/strict");
var test = require("node:test");

test("parses OMIE hourly Portugal prices", function () {
  var parsed = omie.parseMarginal(
    "MARGINALPDBC;\r\n2026;09;13;1;204.5;204.5;\r\n2026;09;13;2;200;200;\r\n*\r\n"
  );
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].hour, 0);
  assert.equal(parsed[0].price, 204.5);
  assert.equal(parsed[1].hour, 1);
});
