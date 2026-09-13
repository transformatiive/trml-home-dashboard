"use strict";

var render = require("../render");
var time = require("../time");

function plugin(ctx) {
  var cal = ctx.calendar || {};
  var rows = "";
  var list = (cal.events || []).slice(0, 8);
  if (!cal.configured) {
    rows =
      "<div class=\"empty\">Calendário ainda sem ICS. Definir CALENDAR_ICS_URL no Railway.</div>";
  } else if (!list.length) {
    rows = "<div class=\"empty sage\">Nada na agenda nas próximas 36 horas.</div>";
  } else {
    list.forEach(function (ev) {
      var when = ev.allDay ? "todo o dia" : time.formatTime(ev.start);
      var cls = "ev kind-" + ev.kind + (ev.happening ? " now" : "");
      if (ev.timesheet) cls += " compact";
      rows +=
        "<div class=\"" +
        cls +
        "\"><span class=\"bar\"></span><span class=\"when\">" +
        render.escapeHtml(when) +
        "</span><span class=\"what\">" +
        render.escapeHtml(ev.summary) +
        "</span></div>";
    });
  }
  var body =
    "<div class=\"panel\">" +
    "<div class=\"kicker\">Calendário</div>" +
    "<div class=\"title\">Hoje e a seguir</div>" +
    "<div class=\"list\">" +
    rows +
    "</div></div>";
  return { title: "Calendário", pluginName: "Calendário", body: body };
}

module.exports = { id: "calendar", name: "Calendário", plugin: plugin };
