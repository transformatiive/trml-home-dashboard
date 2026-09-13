"use strict";

var ui = require("../lib/ui");

function plugin(ctx) {
  var e = ctx.email || {};
  var people = "";
  (e.people || []).forEach(function (p) {
    people += ui.item("icon-people", p.subject, p.from);
  });
  var status;
  if (!e.configured) {
    status = ui.item(
      "icon-mail",
      "Email Meter à espera de IMAP",
      "EMAIL_IMAP_USER / EMAIL_IMAP_PASS · sem corpo de mensagens"
    );
  } else {
    status =
      '<table class="metrics" width="100%"><tr>' +
      ui.metric("icon-mail", e.unseen, "não lidas") +
      ui.metric("icon-people", e.people.length, "pessoas") +
      ui.metric("icon-noise", e.noise, "ruído") +
      "</tr></table>" +
      (people || '<div class="label">sem threads de pessoas nas não-lidas recentes</div>');
  }
  var body =
    '<div class="panel">' +
    ui.titleBar("icon-mail", "Email Meter", "Transformatiive") +
    status +
    "</div>";
  return { title: "Email", pluginName: "Email Meter", body: body };
}

module.exports = { id: "email", name: "Email Meter", plugin: plugin };
