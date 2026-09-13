"use strict";

module.exports = { id: "warnings", name: "Avisos", plugin: function (ctx) {
  var render = require("../render");
  var w = ctx.warnings || {};
  var rows = "";
  if (!w.items || !w.items.length) {
    rows = "<div class=\"empty sage\">Lisboa sem avisos IPMA. C\u00e9u e vento est\u00e1veis para o c\u00e3o e para a estrada.</div>";
  } else {
    w.items.forEach(function (item) {
      rows += "<div class=\"warn-row " + render.attr(item.color) + "\"><div class=\"title\">" + render.escapeHtml(item.type) + "</div><div class=\"sub\">" + render.escapeHtml(item.level) + (item.text ? " \u00b7 " + render.escapeHtml(item.text) : "") + "</div></div>";
    });
  }
  return { title: "Avisos", pluginName: "Avisos", body: "<div class=\"panel\"><div class=\"kicker\">IPMA</div><div class=\"title\">Avisos</div>" + rows + "</div>", sky: w.color === "ok" ? "clear" : "storm" };
} };
