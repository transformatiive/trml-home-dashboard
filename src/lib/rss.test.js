"use strict";

var rss = require("./rss");
var assert = require("node:assert/strict");
var test = require("node:test");

var sample =
  "<rss><channel>" +
  "<item><title>Política A</title><category>Política</category><pubDate>Sun, 13 Sep 2026 07:00:00 GMT</pubDate><description>Lead um</description></item>" +
  "<item><title>Política B</title><category>Política</category><pubDate>Sun, 13 Sep 2026 06:50:00 GMT</pubDate></item>" +
  "<item><title>Local C</title><category>Local</category><pubDate>Sun, 13 Sep 2026 06:40:00 GMT</pubDate></item>" +
  "</channel></rss>";

test("parseRss keeps pubDate and source", function () {
  var items = rss.parseRss(sample, "Público");
  assert.equal(items.length, 3);
  assert.equal(items[0].source, "Público");
  assert.ok(items[0].pubDate instanceof Date);
  assert.equal(items[0].category, "Política");
});

test("mergeNews dedupes and splits same-section top two", function () {
  var a = rss.parseRss(sample, "Público");
  var b = rss.parseRss(
    "<rss><channel><item><title>Política A</title><category>Política</category><pubDate>Sun, 13 Sep 2026 08:00:00 GMT</pubDate></item></channel></rss>",
    "Expresso"
  );
  var merged = rss.mergeNews([a, b]);
  assert.equal(merged.length, 3);
  assert.notEqual(merged[0].category, merged[1].category);
});
