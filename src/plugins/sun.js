"use strict";

var time = require("../time");
var ui = require("../lib/ui");
var render = require("../render");
var sunarc = require("../lib/sunarc");
var fmt = require("../lib/fmt");

function parseStamp(iso) {
  var m = /T(\d{2}):(\d{2})/.exec(iso || "");
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function htmlArc(nowMin, riseM, setM) {
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
  return (
    '<table class="sunarc" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    cells +
    "</tr></table>"
  );
}

function plugin(ctx) {
  var w = ctx.weather || {};
  var now = ctx.now;
  var nowMin = time.minutesOfDay(now);
  var times = sunarc.solarTimes(now);
  var yTimes = sunarc.solarTimes(time.addDays(now, -1));
  if (w.sunrise) {
    var r = parseStamp(w.sunrise);
    var s = parseStamp(w.sunset);
    if (r != null && s != null) {
      times.rise = r;
      times.set = s;
      times.zenith = Math.round((r + s) / 2);
      times.dayLen = s - r;
    }
  }
  if (w.ySunrise) {
    var yr = parseStamp(w.ySunrise);
    var ys = parseStamp(w.ySunset);
    if (yr != null && ys != null) {
      yTimes.rise = yr;
      yTimes.set = ys;
      yTimes.dayLen = ys - yr;
    }
  }
  var delta = sunarc.durationDelta(times, yTimes);
  var status = sunarc.statusLine(nowMin, times);
  var hm = time.hourMinute(now);
  var theme = time.themeName(now);
  var qs = ctx.qs || "";
  var src =
    "/img/sunarc.png?d=" +
    encodeURIComponent(time.ymd(now)) +
    "&t=" +
    encodeURIComponent(fmt.pad2(hm.hour) + fmt.pad2(hm.minute)) +
    "&theme=" +
    encodeURIComponent(theme) +
    (qs ? "&" + qs.replace(/^\?/, "") : "");
  var arc = ctx.skipSunPng
    ? htmlArc(nowMin, times.rise, times.set)
    : '<img class="sunarc-img" src="' +
      render.attr(src) +
      '" width="928" height="268" alt="" />';
  var dayH = Math.floor(times.dayLen / 60);
  var dayM = times.dayLen % 60;
  var ghAm = sunarc.labelTime(times.rise - 45) + "–" + sunarc.labelTime(times.rise + 45);
  var ghPm = sunarc.labelTime(times.set - 45) + "–" + sunarc.labelTime(times.set + 45);
  var civil = sunarc.labelTime(times.set) + "–" + sunarc.labelTime(times.dusk);
  var moon = sunarc.moonInfo(now);
  var body =
    '<div class="panel">' +
    ui.header("Sol em Oeiras", status) +
    '<table class="hero" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    ui.statCol("nascer", sunarc.labelTime(times.rise)) +
    ui.statCol("agora", time.formatTime(now), "amber") +
    ui.statCol("pôr", sunarc.labelTime(times.set)) +
    '<td class="stat-col split" valign="top" align="right">' +
    '<div class="hero-m">' +
    render.escapeHtml(dayH + " h " + fmt.pad2(dayM) + " min") +
    '</div><div class="label ' +
    (delta.negative ? "accent-alert" : "accent-sage") +
    '">' +
    render.escapeHtml(delta.text) +
    "</div></td></tr></table>" +
    arc +
    '<table class="footer-line" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td valign="top"><div class="label">golden hour manhã</div><div class="value">' +
    render.escapeHtml(ghAm) +
    "</div></td>" +
    '<td class="split" valign="top"><div class="label">golden hour tarde</div><div class="value accent-amber">' +
    render.escapeHtml(ghPm) +
    "</div></td>" +
    '<td class="split" valign="top"><div class="label">crepúsculo civil</div><div class="value">' +
    render.escapeHtml(civil) +
    "</div></td>" +
    '<td class="split" valign="top"><div class="label">lua</div><div class="value accent-slate">' +
    render.escapeHtml(String(moon.pct) + "% · " + sunarc.labelTime(moon.rise)) +
    "</div></td></tr></table></div>";
  return { title: "Sol", pluginName: "Nascer / pôr", body: body };
}

module.exports = { id: "sun", name: "Nascer / pôr", plugin: plugin, htmlArc: htmlArc };
