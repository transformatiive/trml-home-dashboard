"use strict";

var ui = require("../lib/ui");
var render = require("../render");
var fmt = require("../lib/fmt");

function plugin(ctx) {
  var ar = ctx.ar || {};
  var meta = ar.configured
    ? "Zoho Books · " + (ar.openCount || 0) + " faturas abertas"
    : "não configurado";
  var overduePct = ar.total ? Math.round((ar.overdueTotal / ar.total) * 100) : 0;
  var bars = (ar.buckets || []).map(function (b) {
    return {
      value: b.value,
      display: fmt.thinInt(b.value) + " €",
      label: b.key + " · " + b.count,
      tone: b.tone,
    };
  });
  var clientRows = "";
  var maxC = 1;
  (ar.clients || []).forEach(function (c) {
    if (c.total > maxC) maxC = c.total;
  });
  (ar.clients || []).forEach(function (c) {
    var cur = Math.round((c.current / maxC) * 100);
    var od = Math.round((c.overdue / maxC) * 100);
    clientRows += ui.hBar(c.name, [
      { pct: cur, tone: "sage" },
      { pct: od, tone: "alert" },
    ], fmt.eurInt(c.total));
  });
  if (!clientRows) {
    clientRows = '<div class="body accent-sage">sem faturas abertas</div>';
  }
  var toBill = (ar.toBill && ar.toBill.lines ? ar.toBill.lines : []).slice(0, 3).join(" · ");
  var body =
    '<div class="panel">' +
    ui.header("Contas a receber", meta) +
    '<table class="hero" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td valign="top">' +
    ui.img("icon-euro", 48) +
    '<div class="hero-l money">' +
    render.escapeHtml(fmt.thinInt(ar.total || 0)) +
    ' <span class="hero-unit">€</span></div></td>' +
    '<td valign="top" align="right">' +
    '<div class="label">em atraso</div><div class="hero-m accent-alert">' +
    render.escapeHtml(fmt.eurInt(ar.overdueTotal || 0)) +
    '</div><div class="label">' +
    render.escapeHtml(String(overduePct) + " % do total · " + String(ar.overdueCount || 0) + " faturas") +
    "</div></td></tr></table>" +
    ui.vBars(bars, { field: "value", min: 0, base: 8, range: 74 }) +
    clientRows +
    '<table class="footer-line" width="100%"><tr>' +
    '<td class="body" valign="middle">ainda a faturar em ' +
    render.escapeHtml(toBill || "setembro") +
    '</td><td class="hero-m accent-sage" align="right" valign="middle">' +
    render.escapeHtml(fmt.eurInt((ar.toBill && ar.toBill.total) || 0)) +
    "</td></tr></table></div>";
  return { title: "Contas a receber", pluginName: "Contas a receber", body: body };
}

module.exports = { id: "ar", name: "Contas a receber", plugin: plugin };
