"use strict";

var ui = require("../lib/ui");
var render = require("../render");
var fmt = require("../lib/fmt");
var time = require("../time");

function plugin(ctx) {
  var items = ctx.news || [];
  var now = ctx.now;
  if (!items.length) {
    var empty =
      '<div class="panel">' +
      ui.header("Notícias", "Público · Expresso") +
      '<div class="hero-m">Notícias indisponíveis</div>' +
      '<div class="label">tente no próximo refresh</div></div>';
    return { title: "Notícias", pluginName: "Notícias", body: empty };
  }
  var fetched = ctx.fetchedAt ? time.formatTime(ctx.fetchedAt) : time.formatTime(now);
  var lead = items[0];
  var rest = items.slice(1, 6);
  var counts = {};
  var sources = { "Público": 0, Expresso: 0 };
  items.forEach(function (it) {
    var sec = it.category || "Outros";
    counts[sec] = (counts[sec] || 0) + 1;
    if (it.source) sources[it.source] = (sources[it.source] || 0) + 1;
  });
  var legend = Object.keys(counts)
    .slice(0, 5)
    .map(function (k) {
      return k + " " + counts[k];
    })
    .join(" · ");
  var rows = "";
  rest.forEach(function (it) {
    rows += ui.listItem(
      fmt.sectionTone(it.category),
      fmt.clip(it.title, 88),
      (it.category || "Geral") + " · " + (it.source || ""),
      fmt.relativeAgeLisbon(it.pubDate, now)
    );
  });
  var shown = Math.min(items.length, 6);
  var body =
    '<div class="panel">' +
    ui.header("Notícias", "Público · Expresso · último refresh " + fetched) +
    '<table class="headline" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td class="list-swatch swatch-' +
    render.attr(fmt.sectionTone(lead.category)) +
    '" width="8" valign="top">&nbsp;</td>' +
    '<td valign="top" style="padding-left:16px">' +
    '<div class="news-kicker">' +
    render.escapeHtml(lead.category || "Geral") +
    '</div><div class="label">' +
    render.escapeHtml(fmt.relativeAgeLisbon(lead.pubDate, now) + " · " + (lead.source || "Público")) +
    '</div><div class="news-hed">' +
    render.escapeHtml(fmt.clip(lead.title, 140)) +
    '</div><div class="news-lead">' +
    render.escapeHtml(fmt.clip(lead.lead || "", 180)) +
    "</div></td></tr></table>" +
    rows +
    '<div class="footer-line label">' +
    render.escapeHtml(legend) +
    " · " +
    render.escapeHtml(String(shown) + " de " + items.length + " manchetes") +
    " · Público " +
    render.escapeHtml(String(sources["Público"] || 0)) +
    " · Expresso " +
    render.escapeHtml(String(sources.Expresso || 0)) +
    "</div></div>";
  return { title: "Notícias", pluginName: "Notícias", body: body };
}

module.exports = { id: "publico", name: "Notícias", plugin: plugin };
