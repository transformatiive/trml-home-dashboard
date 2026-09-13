"use strict";

var time = require("./time");

function row(label, v) {
  return { label: label, v: v == null ? "—" : String(v) };
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
    return { l: d.date.slice(8), v: d.max + "° / " + d.min + "°" };
  });
  var headlines = news.slice(0, 5).map(function (n) {
    return { s: n.category || "Público", t: n.title };
  });
  var wx = [
    {
      title: "Tempo",
      big: { v: w.temp != null ? w.temp + "°" : "—", l: w.label || "Lisboa" },
      rows: [
        row("Vento", w.wind != null ? w.wind + " km/h" : "—"),
        row("Humidade", w.humidity != null ? w.humidity + "%" : "—"),
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
      temp: w.temp != null ? String(w.temp) : "—",
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
      return { label: "Público", kicker: h.s, title: h.t, summary: "", image: "" };
    }),
    wx: wx,
    curios: { wiki: "", births: "", quakes: "", xkcd: "", iss: "" },
    sites: [],
  };
}

module.exports = { buildLegacyPayload: buildLegacyPayload };
