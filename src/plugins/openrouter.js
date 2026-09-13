"use strict";

var time = require("../time");
var ui = require("../lib/ui");
var render = require("../render");
var fmt = require("../lib/fmt");

function plugin(ctx) {
  var o = ctx.openrouter || {};
  var now = ctx.now;
  var p = time.parts(now);
  var monthsPt = [
    "JANEIRO",
    "FEVEREIRO",
    "MARÇO",
    "ABRIL",
    "MAIO",
    "JUNHO",
    "JULHO",
    "AGOSTO",
    "SETEMBRO",
    "OUTUBRO",
    "NOVEMBRO",
    "DEZEMBRO",
  ];
  var monthName = monthsPt[Number(p.month) - 1];
  var meta = o.configured
    ? (o.day || Number(p.day)) + " dias decorridos · saldo " + fmt.eurDec(o.balance || 0)
    : "não configurado";
  var up = (o.delta || 0) >= 0;
  var maxW = 1;
  (o.workspaces || []).forEach(function (w) {
    if (w.value > maxW) maxW = w.value;
  });
  var ws = "";
  (o.workspaces || []).forEach(function (w) {
    var pct = Math.max(1, Math.round((w.value / maxW) * 100));
    ws += ui.hBar(w.name, [{ pct: pct, tone: w.tone || "slate" }, { pct: Math.max(0, 100 - pct), tone: "neutral" }], fmt.eurDec(w.value));
  });
  if (!ws) ws = '<div class="body">sem dados de consumo</div>';
  var monthCells = "";
  var maxM = 1;
  (o.months || []).forEach(function (m) {
    if (m.value > maxM) maxM = m.value;
  });
  (o.months || []).forEach(function (m) {
    var h = 8 + Math.round((m.value / maxM) * 18);
    monthCells +=
      '<td valign="bottom" align="center" width="16%"><div class="vbar-fill ' +
      (m.current ? "fill-amber" : "fill-inert") +
      '" style="height:' +
      h +
      'px;width:26px">&nbsp;</div><div class="label">' +
      render.escapeHtml(m.label) +
      "</div></td>";
  });
  var body =
    '<div class="panel">' +
    ui.header("OpenRouter · " + monthName, meta) +
    '<table class="hero" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td valign="top">' +
    ui.img("icon-chart", 40) +
    " " +
    ui.img("icon-ai", 40) +
    '<div class="hero-l money">' +
    render.escapeHtml(fmt.eurDec(o.spent || 0).replace(" €", "")) +
    ' <span class="hero-unit">€</span></div></td>' +
    '<td valign="top" align="right">' +
    '<div class="hero-m ' +
    (up ? "accent-amber" : "accent-sage") +
    '">' +
    render.escapeHtml((up ? "+" : "") + fmt.eurDec(o.delta || 0)) +
    '</div><div class="label">projeção do mês ' +
    render.escapeHtml(fmt.eurDec(o.projected || 0)) +
    "</div></td></tr></table>" +
    ws +
    '<table class="footer-line" width="100%"><tr>' +
    monthCells +
    '<td valign="middle"><div class="label">modelo</div><div class="body">' +
    render.escapeHtml(o.topModel || "—") +
    " " +
    render.escapeHtml(o.topModelPct ? o.topModelPct + " %" : "") +
    '</div></td><td valign="middle" align="right"><div class="label">tokens</div><div class="hero-m">' +
    render.escapeHtml(fmt.thinInt(o.tokens || 0)) +
    "</div></td></tr></table></div>";
  return { title: "OpenRouter", pluginName: "OpenRouter", body: body };
}

module.exports = { id: "openrouter", name: "OpenRouter", plugin: plugin };
