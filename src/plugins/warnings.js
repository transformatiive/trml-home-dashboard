"use strict";

var render = require("../render");

function plugin(ctx) {
  var w = ctx.warnings || {};
  var rows = "";
  if (!w.items || !w.items.length) {
    rows =
      "<div class=\"empty sage\">Lisboa sem avisos IPMA. Céu e vento estáveis para o cão e para a estrada.</div>";
  } else {
    w.items.forEach(function (item) {
      rows +=
        "<div class=\"warn-row " +
        render.attr(item.color) +
        "\"><div class=\"title\">" +
        render.escapeHtml(item.type) +
        "</div><div class=\"sub\">" +
        render.escapeHtml(item.level) +
        (item.text ? " · " + render.escapeHtml(item.text) : "") +
        "</div></div>";
    });
  }
  var body =
    "<div class=\"panel\">" +
    "<div class=\"kicker\">IPMA</div>" +
    "<div class=\"title\">Avisos</div>" +
    rows +
    "</div>";
  return { title: "Avisos", pluginName: "Avisos", body: body, sky: w.color === "ok" ? "clear" : "storm" };
}

module.exports = { id: "warnings", name: "Avisos", plugin: plugin };
