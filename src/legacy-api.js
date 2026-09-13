"use strict";

var time = require("./time");

function row(label, v) {
  return { label: label, v: v == null ? "\u2014" : String(v) };
}

function buildLegacyPayload(state) {
  var now = time.lisbonNow();
  var w = state.weather || {};
  var cal = state.calendar || {};
  var warn = state.warnings || {};
  var news = state.news || [];
  var events = (cal.events || []).slice(0, 6).map(function (ev) {
    return {
      label: ev.summary,
      v: ev.allDay ? "todo o dia" : time.formatTime(ev.start),
    };
  });
  var days = (w.days || []).map(function (d) {
    return { l: d.date.slice(8), v: d.max + "\u00b0 / " + d.min + "\u00b0" };
  });
  var headlines = news.slice(0, 5).map(function (n) {
    return { s: n.category || "P\u00fablico", t: n.title };
  });
  var wx = [
    {
      title: "Tempo",
      big: { v: w.temp != null ? w.temp + "\u00b0" : "\u2014", l: w.label || "Lisboa" },
      rows: [
        row("Vento", w.wind != null ? w.wind + " km/h" : "\u2014"),
        row("Humidade", w.humidity != null ? w.humidity + "%" : "\u2014"),
        row("Avisos", warn.items && warn.items.length ? warn.items[0].type : "sem avisos"),
      ],
    },
  ];
  return {
    clock: time.formatTime(now),
    date: time.formatDateLong(now),
    place: "Lisboa",
    updated: state.fetchedAt ? "Atualizado " + time.formatTime(state.fetchedAt) : "a actualizar",
    weather: {
      temp: w.temp != null ? String(w.temp) : "\u2014",
      text: w.label || "",
      sub: "Lisboa",
      hours: [],
      days: days,
    },
    sun: { rise: "", set: "", air: "" },
    detail: [],
    events: events,
    todayCount: events.length + " compromissos",
    news: { pt: headlines, world: [], tech: [] },
    numbers: [],
    history: [],
    power: { now: "", range: "", cheap: "" },
    work: { tickets: [], rows: [], stamp: "" },
    stories: headlines.map(function (h) {
      return { label: "P\u00fablico", kicker: h.s, title: h.t, summary: "", image: "" };
    }),
    wx: wx,
    curios: { wiki: "", births: "", quakes: "", xkcd: "", iss: "" },
    sites: [],
  };
}

module.exports = { buildLegacyPayload: buildLegacyPayload };
