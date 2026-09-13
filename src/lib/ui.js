"use strict";

var render = require("../render");

function img(name, size) {
  size = size || 32;
  return (
    '<img class="ico" src="/icons/' +
    name +
    '.png" width="' +
    size +
    '" height="' +
    size +
    '" alt="" />'
  );
}

function titleBar(icon, title, meta) {
  return (
    '<table class="titlebar" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td class="tb-icon" width="44" valign="middle">' +
    img(icon, 32) +
    "</td>" +
    '<td class="tb-title" valign="middle">' +
    render.escapeHtml(title) +
    "</td>" +
    (meta
      ? '<td class="tb-meta" align="right" valign="middle">' +
        render.escapeHtml(meta) +
        "</td>"
      : "") +
    "</tr></table>"
  );
}

function wxIconName(code, night) {
  var c = Number(code || 0);
  if (c === 0) return night ? "wx-moon" : "wx-sun";
  if (c <= 3) return night ? "wx-cloud" : "wx-partly";
  if (c === 45 || c === 48) return "wx-fog";
  if (c >= 51 && c <= 82) return "wx-rain";
  if (c >= 95) return "wx-storm";
  return "wx-partly";
}

function wxIcon(code, night, size) {
  return img(wxIconName(code, night), size || 48);
}

function kindIcon(kind) {
  if (kind === "home") return "icon-home";
  if (kind === "family") return "icon-family";
  if (kind === "holiday") return "icon-holiday";
  return "icon-work";
}

function item(icon, primary, secondary, extraClass) {
  return (
    '<table class="item ' +
    render.attr(extraClass || "") +
    '" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td class="item-ico" width="44" valign="middle">' +
    img(icon, 32) +
    "</td>" +
    '<td class="item-main" valign="middle"><div class="item-pri">' +
    render.escapeHtml(primary) +
    "</div>" +
    (secondary
      ? '<div class="item-sec">' + render.escapeHtml(secondary) + "</div>"
      : "") +
    "</td></tr></table>"
  );
}

function progress(pct) {
  var p = Math.max(1, Math.min(99, Math.round(pct)));
  return (
    '<table class="progress" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td class="progress-fill" width="' +
    p +
    '%">&nbsp;</td>' +
    '<td class="progress-rest">&nbsp;</td></tr></table>'
  );
}

function metric(icon, value, label) {
  return (
    '<td class="metric" valign="top" align="center">' +
    img(icon, 32) +
    '<div class="value">' +
    render.escapeHtml(String(value)) +
    '</div><div class="label">' +
    render.escapeHtml(label) +
    "</div></td>"
  );
}

function hourBars(rows, field, barClass) {
  if (!rows || !rows.length) return "";
  var vals = rows.map(function (r) {
    return Number(r[field]);
  });
  var min = Math.min.apply(null, vals);
  var max = Math.max.apply(null, vals);
  var span = Math.max(1, max - min);
  var cells = "";
  rows.forEach(function (r, i) {
    var h = 12 + Math.round(((Number(r[field]) - min) / span) * 70);
    var nowCls = r.now ? " now" : "";
    var cheap = r.band ? " " + r.band : "";
    cells +=
      '<td class="hbar' +
      nowCls +
      cheap +
      '" valign="bottom" align="center">' +
      '<div class="hbar-fill ' +
      (barClass || "") +
      '" style="height:' +
      h +
      'px">&nbsp;</div>' +
      '<div class="hbar-lab">' +
      render.escapeHtml(String(r.label != null ? r.label : i)) +
      "</div></td>";
  });
  return (
    '<table class="hbars" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    cells +
    "</tr></table>"
  );
}

module.exports = {
  img: img,
  titleBar: titleBar,
  wxIconName: wxIconName,
  wxIcon: wxIcon,
  kindIcon: kindIcon,
  item: item,
  progress: progress,
  metric: metric,
  hourBars: hourBars,
};
