"use strict";

var render = require("../render");

function plugin(ctx) {
  var w = ctx.weather || {};
  var days = "";
  (w.days || []).slice(0, 3).forEach(function (d) {
    days +=
      "<td class=\"day\" valign=\"top\"><div class=\"sub\">" +
      render.escapeHtml(d.date.slice(8)) +
      "</div><div class=\"line\">" +
      render.escapeHtml(String(d.max)) +
      "° / " +
      render.escapeHtml(String(d.min)) +
      "°</div><div class=\"sub\">" +
      render.escapeHtml(d.label) +
      "</div></td>";
  });
  var body =
    "<div class=\"panel weather\">" +
    "<div class=\"kicker\">" +
    render.escapeHtml(w.city || "Lisboa") +
    "</div>" +
    "<div class=\"temp huge\">" +
    (w.temp != null ? render.escapeHtml(String(w.temp)) + "°" : "—") +
    "</div>" +
    "<div class=\"title\">" +
    render.escapeHtml(w.label || "Tempo") +
    "</div>" +
    "<div class=\"sub\">vento " +
    render.escapeHtml(String(w.wind || "—")) +
    " km/h · humidade " +
    render.escapeHtml(String(w.humidity || "—")) +
    "%</div>" +
    "<table class=\"days\" width=\"100%\"><tr>" +
    days +
    "</tr></table></div>";
  return {
    title: "Tempo",
    pluginName: "Tempo",
    sky: w.sky || "",
    body: body,
  };
}

module.exports = { id: "weather", name: "Tempo", plugin: plugin };
