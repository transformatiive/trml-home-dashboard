"use strict";

var render = require("../render");

function img(name, size, qs) {
  size = size || 32;
  var extra = qs ? (String(qs).charAt(0) === "?" ? qs : "?" + qs) : "";
  return (
    '<img class="ico" src="/icons/' +
    name +
    ".png" +
    extra +
    '" width="' +
    size +
    '" height="' +
    size +
    '" alt="" />'
  );
}

function fillClass(tone) {
  var t = String(tone || "slate");
  if (t === "ok" || t === "sage" || t === "home" || t === "foco") return "fill-sage";
  if (t === "alert") return "fill-alert";
  if (t === "amber" || t === "warn" || t === "family" || t === "viagem" || t === "hot" || t === "cheap") {
    return "fill-amber";
  }
  if (t === "dear") return "fill-alert";
  if (t === "holiday") return "fill-holiday";
  if (t === "sun") return "fill-sun";
  if (t === "inert" || t === "pessoal") return "fill-inert";
  if (t === "neutral") return "fill-neutral";
  return "fill-slate";
}

function accentClass(tone) {
  var t = String(tone || "");
  if (!t) return "";
  if (t === "ok" || t === "sage" || t === "home" || t === "foco") return "accent-sage";
  if (t === "alert") return "accent-alert";
  if (t === "amber" || t === "warn" || t === "family" || t === "viagem" || t === "hot") return "accent-amber";
  if (t === "holiday") return "accent-holiday";
  if (t === "sun") return "accent-sun";
  return "accent-slate";
}

function header(eyebrow, meta) {
  return (
    '<table class="header" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td class="eyebrow" valign="middle">' +
    render.escapeHtml(eyebrow) +
    "</td>" +
    (meta
      ? '<td class="meta" align="right" valign="middle">' +
        render.escapeHtml(meta) +
        "</td>"
      : "") +
    "</tr></table>"
  );
}

function titleBar(title, meta) {
  return header(title, meta);
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

function kindTone(kind) {
  if (kind === "home") return "home";
  if (kind === "family") return "family";
  if (kind === "holiday") return "holiday";
  if (kind === "foco") return "foco";
  if (kind === "viagem") return "viagem";
  if (kind === "pessoal") return "pessoal";
  return "work";
}

function item(primary, secondary, extraClass, tone) {
  var swatch =
    tone
      ? '<td class="swatch swatch-' +
        render.attr(tone) +
        '" width="8" valign="top">&nbsp;</td>'
      : "";
  return (
    '<table class="item ' +
    render.attr(extraClass || "") +
    '" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    swatch +
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

function metric(value, label) {
  return (
    '<td class="metric" valign="top">' +
    '<div class="value">' +
    render.escapeHtml(String(value)) +
    '</div><div class="label">' +
    render.escapeHtml(label) +
    "</div></td>"
  );
}

function hourBars(rows, field, opts) {
  opts = opts || {};
  if (!rows || !rows.length) return "";
  var vals = rows.map(function (r) {
    return Number(r[field]);
  });
  var min = Math.min.apply(null, vals);
  var max = Math.max.apply(null, vals);
  var span = Math.max(1, max - min);
  var base = opts.base != null ? opts.base : 16;
  var range = opts.range != null ? opts.range : 88;
  var cells = "";
  rows.forEach(function (r, i) {
    var h = base + Math.round(((Number(r[field]) - min) / span) * range);
    var nowCls = r.now ? " now" : "";
    var cheap = r.band ? " " + r.band : "";
    cells +=
      '<td class="hbar' +
      nowCls +
      cheap +
      '" valign="bottom" align="center">' +
      '<div class="hbar-fill" style="height:' +
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

function statCol(label, value, accent) {
  return (
    '<td class="stat-col" valign="top">' +
    '<div class="label">' +
    render.escapeHtml(label) +
    '</div><div class="hero-m ' +
    accentClass(accent) +
    '">' +
    render.escapeHtml(String(value)) +
    "</div></td>"
  );
}

function statRow(label, value, unit, accent) {
  return (
    '<table class="stat-row" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td class="label" valign="bottom">' +
    render.escapeHtml(label) +
    '</td><td class="value ' +
    accentClass(accent) +
    '" align="right" valign="bottom">' +
    render.escapeHtml(String(value)) +
    (unit ? ' <span class="label">' + render.escapeHtml(unit) + "</span>" : "") +
    "</td></tr><tr><td colspan=\"2\" class=\"hairline\">&nbsp;</td></tr></table>"
  );
}

function vBars(rows, opts) {
  opts = opts || {};
  if (!rows || !rows.length) return "";
  var field = opts.field || "value";
  var vals = rows.map(function (r) {
    return Number(r[field] != null ? r[field] : r.temp);
  });
  var min = opts.min != null ? opts.min : Math.min.apply(null, vals);
  var max = opts.max != null ? opts.max : Math.max.apply(null, vals);
  var span = Math.max(1, max - min);
  var base = opts.base != null ? opts.base : 16;
  var range = opts.range != null ? opts.range : 88;
  var cells = "";
  rows.forEach(function (r, i) {
    var n = Number(r[field] != null ? r[field] : r.temp);
    var h = base + Math.round(((n - min) / span) * range);
    var nowCls = r.now ? " now" : "";
    var tone = r.tone || r.band || opts.tone || "slate";
    cells +=
      '<td class="vbar' +
      nowCls +
      '" valign="bottom" align="center">' +
      '<div class="value">' +
      render.escapeHtml(String(r.display != null ? r.display : n)) +
      '</div><div class="vbar-fill ' +
      fillClass(tone) +
      '" style="height:' +
      h +
      'px">&nbsp;</div><div class="label">' +
      render.escapeHtml(String(r.label != null ? r.label : i)) +
      "</div></td>";
  });
  return (
    '<table class="vbars" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    cells +
    "</tr></table>"
  );
}

function hBar(label, segments, value) {
  var segs = "";
  var i;
  var list = segments || [];
  for (i = 0; i < list.length; i++) {
    var s = list[i];
    var w = Math.max(1, Math.round(Number(s.pct || s.share || 0)));
    segs +=
      '<td class="hbar-seg ' +
      fillClass(s.tone) +
      '" width="' +
      w +
      '%">&nbsp;</td>';
  }
  if (!list.length) {
    segs = '<td class="hbar-seg fill-neutral">&nbsp;</td>';
  }
  return (
    '<table class="hbar-row" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td class="body" width="210" valign="middle">' +
    render.escapeHtml(label) +
    '</td><td valign="middle"><table class="hbar-track" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    segs +
    '</tr></table></td><td class="value" width="104" align="right" valign="middle">' +
    render.escapeHtml(String(value)) +
    "</td></tr></table>"
  );
}

function listItem(swatchTone, primary, secondary, right) {
  return (
    '<table class="list-item" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td class="list-swatch swatch-' +
    render.attr(swatchTone || "work") +
    '" width="8" valign="top">&nbsp;</td>' +
    '<td class="item-main" valign="middle"><div class="body">' +
    render.escapeHtml(primary) +
    "</div>" +
    (secondary
      ? '<div class="label">' + render.escapeHtml(secondary) + "</div>"
      : "") +
    "</td>" +
    (right != null && right !== ""
      ? '<td class="value" align="right" valign="middle">' +
        render.escapeHtml(String(right)) +
        "</td>"
      : "") +
    "</tr></table>"
  );
}

function monthStrip(monthsElapsed, pctCurrent) {
  var initials = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  var elapsed = Math.max(0, Math.min(11, Math.round(monthsElapsed || 0)));
  var pct = Math.max(0, Math.min(100, Number(pctCurrent) || 0));
  var fillH = Math.max(1, Math.round((62 * pct) / 100));
  var restH = Math.max(1, 62 - fillH);
  var cells = "";
  var i;
  for (i = 0; i < 12; i++) {
    var labCls = "month-lab";
    var inner;
    if (i < elapsed) {
      inner = '<div class="month-block">&nbsp;</div>';
    } else if (i === elapsed) {
      labCls += " current";
      inner =
        '<table width="100%" cellpadding="0" cellspacing="0"><tr><td class="month-block future" height="' +
        restH +
        '">&nbsp;</td></tr><tr><td class="month-current-fill" height="' +
        fillH +
        '">&nbsp;</td></tr></table>';
    } else {
      inner = '<div class="month-block future">&nbsp;</div>';
    }
    cells +=
      '<td class="month-cell" width="8%" valign="bottom" align="center">' +
      inner +
      '<div class="' +
      labCls +
      '">' +
      initials[i] +
      "</div></td>";
  }
  return (
    '<table class="month-strip" width="100%" cellpadding="0" cellspacing="4"><tr>' +
    cells +
    "</tr></table>"
  );
}

function dayColumn(blocks) {
  var START = 7 * 60;
  var END = 22 * 60;
  var PX_PER_HOUR = 37.4;
  var totalH = 561;
  var items = (blocks || [])
    .map(function (b) {
      var start = b.startMin != null ? b.startMin : Math.round(Number(b.startHour || 0) * 60);
      var dur = b.durationMin != null ? b.durationMin : Math.round(Number(b.durationHours || 0) * 60);
      return { start: start, end: start + dur, tone: b.tone || "neutral" };
    })
    .sort(function (a, b) {
      return a.start - b.start;
    });
  var segs = [];
  var cursor = START;
  var i;
  function pushSeg(from, to, tone) {
    var clippedFrom = Math.max(START, from);
    var clippedTo = Math.min(END, to);
    if (clippedTo <= clippedFrom) return;
    segs.push({
      tone: tone,
      height: Math.max(1, Math.round(((clippedTo - clippedFrom) / 60) * PX_PER_HOUR)),
    });
  }
  for (i = 0; i < items.length; i++) {
    var b = items[i];
    if (b.start > cursor) pushSeg(cursor, b.start, "neutral");
    pushSeg(b.start, b.end, b.tone);
    cursor = Math.max(cursor, b.end);
  }
  if (cursor < END) pushSeg(cursor, END, "neutral");
  if (!segs.length) {
    segs = [{ tone: "neutral", height: totalH }];
  }
  var bar = "";
  for (i = 0; i < segs.length; i++) {
    bar +=
      '<div class="day-seg ' +
      fillClass(segs[i].tone) +
      '" style="height:' +
      segs[i].height +
      'px">&nbsp;</div>';
  }
  return (
    '<table class="day-col" cellpadding="0" cellspacing="0"><tr>' +
    '<td class="day-bar" valign="top" width="12">' +
    bar +
    '</td><td class="day-hours" valign="top" width="44">' +
    '<div>07</div>' +
    '<div style="height:137px">&nbsp;</div><div>11</div>' +
    '<div style="height:137px">&nbsp;</div><div>15</div>' +
    '<div style="height:137px">&nbsp;</div><div>19</div>' +
    '<div style="height:100px">&nbsp;</div><div>22</div>' +
    "</td></tr></table>"
  );
}

module.exports = {
  img: img,
  fillClass: fillClass,
  accentClass: accentClass,
  header: header,
  titleBar: titleBar,
  wxIconName: wxIconName,
  wxIcon: wxIcon,
  kindTone: kindTone,
  item: item,
  progress: progress,
  metric: metric,
  hourBars: hourBars,
  statCol: statCol,
  statRow: statRow,
  vBars: vBars,
  hBar: hBar,
  listItem: listItem,
  monthStrip: monthStrip,
  dayColumn: dayColumn,
};
