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

function parsePubDate(raw) {
  if (!raw) return null;
  var d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  return d;
}

function parseRss(xml, source) {
  var items = [];
  var re = /<item\b[\s\S]*?<\/item>/gi;
  var match;
  while ((match = re.exec(xml))) {
    var block = match[0];
    var title = tag(block, "title");
    var category = tag(block, "category") || tag(block, "dc:subject");
    var pubDate = parsePubDate(tag(block, "pubDate") || tag(block, "dc:date"));
    var desc = tag(block, "description").replace(/<[^>]+>/g, "").trim();
    if (title) {
      items.push({
        title: title,
        category: category,
        pubDate: pubDate,
        source: source || "",
        lead: desc,
      });
    }
  }
  return items;
}

function normalizeTitle(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9à-ÿ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function mergeNews(lists) {
  var all = [];
  (lists || []).forEach(function (list) {
    (list || []).forEach(function (item) {
      all.push(item);
    });
  });
  all.sort(function (a, b) {
    var ta = a.pubDate ? a.pubDate.getTime() : 0;
    var tb = b.pubDate ? b.pubDate.getTime() : 0;
    return tb - ta;
  });
  var seen = {};
  var unique = [];
  all.forEach(function (item) {
    var key = normalizeTitle(item.title);
    if (!key || seen[key]) return;
    seen[key] = true;
    unique.push(item);
  });
  if (unique.length >= 2 && (unique[0].category || "") === (unique[1].category || "")) {
    var i;
    for (i = 2; i < unique.length; i++) {
      if ((unique[i].category || "") !== (unique[0].category || "")) {
        var swap = unique[1];
        unique[1] = unique[i];
        unique[i] = swap;
        break;
      }
    }
  }
  return unique;
}

module.exports = {
  parseRss: parseRss,
  mergeNews: mergeNews,
  normalizeTitle: normalizeTitle,
  parsePubDate: parsePubDate,
};
