"use strict";

var render = require("../render");

function plugin(ctx) {
  var e = ctx.email || {};
  var people = "";
  (e.people || []).forEach(function (p) {
    people +=
      "<div class=\"ev\"><span class=\"what\">" +
      render.escapeHtml(p.subject) +
      "</span><span class=\"when\">" +
      render.escapeHtml(p.from) +
      "</span></div>";
  });
  var status;
  if (!e.configured) {
    status =
      "<div class=\"empty\">Email Meter à espera de IMAP (EMAIL_IMAP_USER / EMAIL_IMAP_PASS). Sem corpo de mensagens neste ecrã.</div>";
  } else {
    status =
      "<table class=\"meters\" width=\"100%\"><tr>" +
      "<td><div class=\"temp\">" +
      render.escapeHtml(String(e.unseen)) +
      "</div><div class=\"kicker\">não lidas</div></td>" +
      "<td><div class=\"temp\">" +
      render.escapeHtml(String(e.people.length)) +
      "</div><div class=\"kicker\">pessoas</div></td>" +
      "<td><div class=\"temp\">" +
      render.escapeHtml(String(e.noise)) +
      "</div><div class=\"kicker\">ruído</div></td>" +
      "</tr></table>" +
      (people ? "<div class=\"list\">" + people + "</div>" : "<div class=\"sub\">sem threads de pessoas nas não-lidas recentes</div>");
  }
  var body =
    "<div class=\"panel\">" +
    "<div class=\"kicker\">Transformatiive</div>" +
    "<div class=\"title\">Email Meter</div>" +
    status +
    "</div>";
  return { title: "Email", pluginName: "Email Meter", body: body };
}

module.exports = { id: "email", name: "Email Meter", plugin: plugin };
