"use strict";

var ui = require("../lib/ui");
var render = require("../render");

function plugin(ctx) {
  var power = ctx.electricity || {};
  var weather = ctx.weather || {};
  var remaining = (power.remaining || []).slice(0, 12);
  var hours = (weather.hours || []).slice(0, 12);
  var nowPrice = power.now ? power.now.price + " €/MWh" : "—";
  var wxRows = "";
  hours.forEach(function (h) {
    wxRows +=
      '<td class="hourcell' +
      (h.now ? " now" : "") +
      '" align="center" valign="bottom">' +
      ui.wxIcon(h.code, h.hour >= 21 || h.hour < 8, 28) +
      '<div class="value-sm">' +
      render.escapeHtml(String(h.temp)) +
      '°</div><div class="label">' +
      render.escapeHtml(String(h.wind)) +
      " km</div>" +
      '<div class="label">' +
      render.escapeHtml(h.label) +
      "h</div></td>";
  });
  var empty = !power.configured
    ? ui.item("icon-bolt", "Preço OMIE indisponível", "Mercado diário Portugal")
    : "";
  var body =
    '<div class="panel">' +
    ui.titleBar("icon-bolt", "Eletricidade + dia", "OMIE PT · " + (weather.city || "Oeiras")) +
    '<table class="metrics" width="100%"><tr>' +
    ui.metric("icon-bolt", nowPrice, "agora") +
    ui.metric("icon-ok", power.cheapest ? power.cheapest.price + " €" : "—", "mais barato") +
    ui.metric("icon-warn", power.peak ? power.peak.price + " €" : "—", "pico") +
    "</tr></table>" +
    '<div class="label">€/MWh a partir desta hora</div>' +
    (remaining.length ? ui.hourBars(remaining, "price", "bar-power") : empty) +
    '<div class="label">Tempo hora a hora · temperatura e vento</div>' +
    '<table class="hours" width="100%"><tr>' +
    (wxRows || '<td class="label">sem horas</td>') +
    "</tr></table></div>";
  return { title: "Energia", pluginName: "Eletricidade", body: body };
}

module.exports = { id: "power", name: "Eletricidade", plugin: plugin };
