'use strict';

var FEEDS = [
  'https://feeds.feedburner.com/PublicoRSS',
  'https://news.google.com/rss/search?q=site:publico.pt&hl=pt-PT&gl=PT&ceid=PT:pt'
];

function decode(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function itemsFromRss(xml) {
  var items = [];
  var re = /<item>([\s\S]*?)<\/item>/gi;
  var m;
  while ((m = re.exec(xml)) && items.length < 8) {
    var block = m[1];
    var title = (block.match(/<title>([\s\S]*?)<\/title>/i) || [])[1];
    var cat = (block.match(/<category>([\s\S]*?)<\/category>/i) || [])[1];
    items.push({
      title: decode(title),
      category: decode(cat) || 'Geral'
    });
  }
  return items;
}

function loadOne(url) {
  return fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 HomeDashboard/1', Accept: 'application/rss+xml, application/xml, text/xml' }
  }).then(function (res) {
    if (!res.ok) throw new Error('rss-http');
    return res.text();
  }).then(function (xml) {
    var items = itemsFromRss(xml);
    if (!items.length) throw new Error('rss-empty');
    return items;
  });
}

function load() {
  return loadOne(FEEDS[0]).catch(function () {
    return loadOne(FEEDS[1]);
  }).then(function (items) {
    return { ok: true, items: items };
  }).catch(function () {
    return { ok: false, items: [] };
  });
}

module.exports = { load: load };
