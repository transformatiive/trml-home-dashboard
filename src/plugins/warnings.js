"use strict";

var ui = require("../lib/ui");

function plugin(ctx) {
  var w = ctx.warnings || {};
  var rows = "";
  if (!w.items || !w.items.length) {
    rows = ui.item("Lisboa sem avisos IPMA", "céu e vento estáveis", "ok", "ok");
  } else {
    w.items.forEach(function (item) {
      var tone = item.color === "alert" ? "alert" : "warn";
      rows += ui.item(
        item.type,
        item.level + (item.text ? " · " + item.text : ""),
        tone,
        tone
      );
    });
  }
  var body =
    '<div class="panel">' +
    ui.titleBar("Avisos IPMA", w.area || "LIS") +
    '<div class="list">' +
    rows +
    "</div></div>";
  return { title: "Avisos", pluginName: "Avisos", body: body };
}

module.exports = { id: "warnings", name: "Avisos", plugin: plugin };
