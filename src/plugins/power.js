"use strict";

var ui = require("../lib/ui");

function plugin(ctx) {
  var power = ctx.electricity || {};
  var remaining = (power.remaining || []).slice(0, 16);
  var nowPrice = power.now ? String(power.now.price) : "—";
  var empty = !power.configured
    ? ui.item("Preço OMIE indisponível", "Mercado diário Portugal", "", "warn")
    : "";
  var body =
    '<div class="panel">' +
    ui.titleBar("Eletricidade", "OMIE PT") +
    '<table class="metrics" width="100%"><tr>' +
    ui.metric(nowPrice, "€/MWh agora") +
    ui.metric(power.cheapest ? String(power.cheapest.price) : "—", "mais barato") +
    ui.metric(power.peak ? String(power.peak.price) : "—", "pico") +
    "</tr></table>" +
    (remaining.length ? ui.hourBars(remaining, "price", { base: 28, range: 340 }) : empty) +
    "</div>";
  return { title: "Energia", pluginName: "Eletricidade", body: body };
}

module.exports = { id: "power", name: "Eletricidade", plugin: plugin };
