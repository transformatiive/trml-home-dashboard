"use strict";

var ui = require("../lib/ui");

function plugin(ctx) {
  var e = ctx.email || {};
  var people = "";
  (e.people || []).forEach(function (p) {
    people += ui.item(p.subject, p.from, "", "mail");
  });
  var status;
  if (!e.configured) {
    status = ui.item(
      "Email Meter à espera de IMAP",
      "contagens, sem corpo de mensagens",
      "",
      "mail"
    );
  } else {
    status =
      '<table class="metrics" width="100%"><tr>' +
      ui.metric(e.unseen, "não lidas") +
      ui.metric(e.people.length, "pessoas") +
      ui.metric(e.noise, "ruído") +
      "</tr></table>" +
      (people || '<div class="label">sem threads de pessoas nas não-lidas recentes</div>');
  }
  var body =
    '<div class="panel">' +
    ui.titleBar("Email Meter", "Transformatiive") +
    status +
    "</div>";
  return { title: "Email", pluginName: "Email Meter", body: body };
}

module.exports = { id: "email", name: "Email Meter", plugin: plugin };
