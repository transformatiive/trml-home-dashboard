"use strict";

var ui = require("../lib/ui");

function plugin(ctx) {
  var items = (ctx.news || []).slice(0, 6);
  var rows = "";
  if (!items.length) {
    rows = ui.item("Público indisponível", "tente no próximo refresh", "", "news");
  } else {
    items.forEach(function (item) {
      rows += ui.item(item.title, item.category || "Público", "", "news");
    });
  }
  var body =
    '<div class="panel">' +
    ui.titleBar("Público", "manchetes") +
    '<div class="list">' +
    rows +
    "</div></div>";
  return { title: "Público", pluginName: "Público", body: body };
}

module.exports = { id: "publico", name: "Público", plugin: plugin };
