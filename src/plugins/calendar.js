"use strict";

var time = require("../time");
var ui = require("../lib/ui");

function plugin(ctx) {
  var cal = ctx.calendar || {};
  var rows = "";
  var list = (cal.events || []).slice(0, 6);
  if (!cal.configured) {
    rows = ui.item("Calendário sem ICS", "Definir CALENDAR_ICS_URL no Railway", "", "warn");
  } else if (!list.length) {
    rows = ui.item("Agenda livre", "Nada nas próximas 36 horas", "ok", "ok");
  } else {
    list.forEach(function (ev) {
      var when = ev.allDay ? "todo o dia" : time.formatTime(ev.start);
      rows += ui.item(
        ev.summary,
        when + (ev.calendar ? " · " + ev.calendar : ""),
        ev.happening ? "hot" : "",
        ui.kindTone(ev.kind)
      );
    });
  }
  var body =
    '<div class="panel">' +
    ui.titleBar("Calendário", "hoje e a seguir") +
    '<div class="list">' +
    rows +
    "</div></div>";
  return { title: "Calendário", pluginName: "Calendário", body: body };
}

module.exports = { id: "calendar", name: "Calendário", plugin: plugin };
