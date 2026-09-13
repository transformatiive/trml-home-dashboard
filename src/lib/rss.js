"use strict";

function decodeEntities(s) {
  return String(s || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function tag(block, name) {
  var re = new RegExp("<" + name + "[^>]*>([\\s\\S]*?)</" + name + ">", "i");
  var m = re.exec(block);
  return m ? decodeEntities(m[1]).trim() : "";
}

function parseRss(xml) {
  var items = [];
  var re = /<item\b[\s\S]*?<\/item>/gi;
  var match;
  while ((match = re.exec(xml))) {
    var block = match[0];
    var title = tag(block, "title");
    var category = tag(block, "category") || tag(block, "dc:subject");
    if (title) {
      items.push({ title: title, category: category });
    }
  }
  return items;
}

module.exports = { parseRss: parseRss };
