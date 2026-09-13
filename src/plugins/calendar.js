'use strict';

var ical = require('node-ical');
var calUtil = require('./calendar-util');

function icsUrls() {
  var urls = [];
  if (process.env.CALENDAR_ICS_URL) urls.push(process.env.CALENDAR_ICS_URL);
  if (process.env.CALENDAR_ICS_URLS) {
    process.env.CALENDAR_ICS_URLS.split(',').forEach(function (u) {
      u = u.trim();
      if (u) urls.push(u);
    });
  }
  return urls;
}

function fetchOne(url) {
  return fetch(url, {
    headers: { 'User-Agent': 'trml-home-dashboard/1', Accept: 'text/calendar' },
    redirect: 'follow'
  }).then(function (res) {
    if (!res.ok) {
      throw new Error('ics-http');
    }
    return res.text();
  }).then(function (text) {
    var data = ical.parseICS(text);
    var events = [];
    var calName = '';
    Object.keys(data).forEach(function (key) {
      var item = data[key];
      if (item.type === 'VCALENDAR' && item['VCALENDAR']) return;
      if (item.type === 'VEVENT') {
        var declined = false;
        var att = item.attendee;
        var list = Array.isArray(att) ? att : att ? [att] : [];
        list.forEach(function (a) {
          var params = (a && a.params) || {};
          var part = String(params.PARTSTAT || params.partstat || '').toUpperCase();
          if (part === 'DECLINED') declined = true;
        });
        var start = item.start instanceof Date ? item.start : new Date(item.start);
        var end = item.end instanceof Date ? item.end : item.end ? new Date(item.end) : new Date(start.getTime() + 60 * 60 * 1000);
        var allDay = !!(item.datetype === 'date' || (item.start && item.start.dateOnly));
        events.push({
          summary: item.summary || '',
          start: start,
          end: end.getTime() <= start.getTime() ? new Date(start.getTime() + 60 * 60 * 1000) : end,
          allDay: allDay,
          status: item.status,
          declined: declined,
          calendarName: calName
        });
      }
    });
    var minT = Date.now() - 2 * 86400000;
    var maxT = Date.now() + 21 * 86400000;
    events = events.filter(function (ev) {
      return ev.end.getTime() >= minT && ev.start.getTime() <= maxT;
    });
    return events;
  });
}

function load() {
  var urls = icsUrls();
  if (!urls.length) {
    return Promise.resolve({ ok: false, reason: 'missing-ics', events: [] });
  }
  return Promise.all(
    urls.map(function (url) {
      return fetchOne(url).catch(function () {
        return [];
      });
    })
  ).then(function (chunks) {
    var events = [];
    chunks.forEach(function (c) {
      events = events.concat(c);
    });
    return { ok: events.length > 0, events: events, reason: events.length ? null : 'empty' };
  });
}

module.exports = { load: load, icsConfigured: function () { return icsUrls().length > 0; }, calUtil: calUtil };
