"use strict";

var time = require("../time");
var ui = require("../lib/ui");

function plugin(ctx) {
  var cal = ctx.calendar || {};
  var rows = "";
  var list = (cal.events || []).slice(0, 7);
  if (!cal.configured) {
    rows = ui.item("icon-cal", "Calendário sem ICS", "Definir CALENDAR_ICS_URL no Railway");
  } else if (!list.length) {
    rows = ui.item("icon-ok", "Agenda livre", "Nada nas próximas 36 horas");
  } else {
    list.forEach(function (ev) {
      var when = ev.allDay ? "todo o dia" : time.formatTime(ev.start);
      rows += ui.item(
        ui.kindIcon(ev.kind),
        ev.summary,
        when + (ev.calendar ? " · " + ev.calendar : ""),
        ev.happening ? "hot" : ev.timesheet ? "compact" : ""
      );
    });
  }
  var body =
    '<div class="panel">' +
    ui.titleBar("icon-cal", "Calendário", "hoje e a seguir") +
    '<div class="list">' +
    rows +
    "</div></div>";
  return { title: "Calendário", pluginName: "Calendário", body: body };
}

module.exports = { id: "calendar", name: "Calendário", plugin: plugin };
