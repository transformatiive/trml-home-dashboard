"use strict";

var ui = require("../lib/ui");

function plugin(ctx) {
  var w = ctx.warnings || {};
  var rows = "";
  if (!w.items || !w.items.length) {
    rows = ui.item("icon-ok", "Lisboa sem avisos IPMA", "Céu e vento estáveis para o cão e para a estrada");
  } else {
    w.items.forEach(function (item) {
      rows += ui.item(
        "icon-warn",
        item.type,
        item.level + (item.text ? " · " + item.text : ""),
        item.color === "alert" ? "hot" : ""
      );
    });
  }
  var body =
    '<div class="panel">' +
    ui.titleBar(w.items && w.items.length ? "icon-warn" : "icon-ok", "Avisos IPMA", w.area || "LIS") +
    '<div class="list">' +
    rows +
    "</div></div>";
  return { title: "Avisos", pluginName: "Avisos", body: body };
}

module.exports = { id: "warnings", name: "Avisos", plugin: plugin };
