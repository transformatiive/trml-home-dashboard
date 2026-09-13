"use strict";

var render = require("../render");

var DOT = ["sage", "sky", "amber", "alert"];

function plugin(ctx) {
  var items = (ctx.news || []).slice(0, 6);
  var rows = "";
  if (!items.length) {
    rows = "<div class=\"empty\">Público indisponível neste momento.</div>";
  } else {
    items.forEach(function (item, i) {
      rows +=
        "<div class=\"news\"><span class=\"dot " +
        DOT[i % DOT.length] +
        "\"></span><span class=\"what\">" +
        render.escapeHtml(item.title) +
        "</span></div>";
    });
  }
  var body =
    "<div class=\"panel\">" +
    "<div class=\"kicker\">Notícias</div>" +
    "<div class=\"title\">Público</div>" +
    "<div class=\"list\">" +
    rows +
    "</div></div>";
  return { title: "Público", pluginName: "Público", body: body };
}

module.exports = { id: "publico", name: "Público", plugin: plugin };
