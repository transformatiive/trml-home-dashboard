"use strict";

var ui = require("../lib/ui");
var render = require("../render");

function plugin(ctx) {
  var power = ctx.electricity || {};
  var weather = ctx.weather || {};
  var remaining = (power.remaining || []).slice(0, 12);
  var hours = (weather.hours || []).slice(0, 12);
  var nowPrice = power.now ? String(power.now.price) : "—";
  var wxRows = "";
  hours.forEach(function (h) {
    wxRows +=
      '<td class="hourcell' +
      (h.now ? " now" : "") +
      '" align="left" valign="top">' +
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
    ? ui.item("Preço OMIE indisponível", "Mercado diário Portugal", "", "warn")
    : "";
  var body =
    '<div class="panel">' +
    ui.titleBar("Eletricidade", "OMIE PT · " + (weather.city || "Oeiras")) +
    '<table class="metrics" width="100%"><tr>' +
    ui.metric(nowPrice, "€/MWh agora") +
    ui.metric(power.cheapest ? String(power.cheapest.price) : "—", "mais barato") +
    ui.metric(power.peak ? String(power.peak.price) : "—", "pico") +
    "</tr></table>" +
    (remaining.length ? ui.hourBars(remaining, "price") : empty) +
    '<div class="label">temperatura e vento</div>' +
    '<table class="hours" width="100%"><tr>' +
    (wxRows || '<td class="label">sem horas</td>') +
    "</tr></table></div>";
  return { title: "Energia", pluginName: "Eletricidade", body: body };
}

module.exports = { id: "power", name: "Eletricidade", plugin: plugin };
