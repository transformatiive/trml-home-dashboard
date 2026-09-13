"use strict";

var time = require("../time");
var ui = require("../lib/ui");
var render = require("../render");

function parseStamp(iso) {
  var m = /T(\d{2}):(\d{2})/.exec(iso || "");
  if (!m) return { h: 0, min: 0, label: "—" };
  return { h: Number(m[1]), min: Number(m[2]), label: m[1] + ":" + m[2] };
}

function minutesOf(p) {
  return p.h * 60 + p.min;
}

function plugin(ctx) {
  var w = ctx.weather || {};
  var now = ctx.now;
  var hm = time.hourMinute(now);
  var nowMin = hm.hour * 60 + hm.minute;
  var rise = parseStamp(w.sunrise);
  var set = parseStamp(w.sunset);
  var riseM = minutesOf(rise);
  var setM = minutesOf(set);
  var dayLen = Math.max(1, setM - riseM);
  var slots = 12;
  var cells = "";
  var i;
  for (i = 0; i < slots; i++) {
    var t = i / (slots - 1);
    var min = riseM + t * dayLen;
    var elev = Math.sin(Math.PI * t);
    var pad = Math.round((1 - elev) * 90);
    var isNow = nowMin >= riseM && nowMin <= setM && Math.abs(min - nowMin) < dayLen / slots;
    cells +=
      '<td class="sunslot" valign="top" align="center">' +
      '<div class="sunpad" style="height:' +
      pad +
      'px"></div>' +
      '<div class="sun-dot' +
      (isNow ? " now" : "") +
      '">&nbsp;</div></td>';
  }
  var afterSet = nowMin > setM;
  var beforeRise = nowMin < riseM;
  var status;
  if (beforeRise) status = "ainda noite · nasce às " + rise.label;
  else if (afterSet) status = "já noite · pôs-se às " + set.label;
  else {
    var left = setM - nowMin;
    status = "dia · pôr-do-sol daqui a " + Math.round(left / 60) + " h " + (left % 60) + " min";
  }
  var body =
    '<div class="panel">' +
    ui.titleBar("Sol em Oeiras", time.formatDateLong(now)) +
    '<table class="metrics" width="100%"><tr>' +
    ui.metric(rise.label, "nascer") +
    ui.metric(time.formatTime(now), "agora") +
    ui.metric(set.label, "pôr") +
    "</tr></table>" +
    '<div class="label">' +
    render.escapeHtml(status) +
    "</div>" +
    '<table class="sunarc" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    cells +
    "</tr></table>" +
    '<table class="horizon" width="100%"><tr><td class="horizon-line">&nbsp;</td></tr></table></div>';
  return { title: "Sol", pluginName: "Nascer / pôr", body: body };
}

module.exports = { id: "sun", name: "Nascer / pôr", plugin: plugin };
