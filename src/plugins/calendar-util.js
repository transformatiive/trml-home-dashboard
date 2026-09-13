'use strict';

var html = require('../html');
var time = require('../time');

function lane(ev) {
  var t = ((ev.summary || '') + ' ' + (ev.calendarName || '')).toLowerCase();
  if (/afonso|família|familia|treino/.test(t)) return 'family';
  if (/cão|cao|almoço|almoco|exercício|exercicio|ginásio|ginasio|passeio/.test(t)) return 'home';
  return 'work';
}

function isTimesheet(ev) {
  return /timesheet|fatura|faturação|faturacao/i.test(ev.summary || '');
}

function isDeclined(ev) {
  if (ev.status && String(ev.status).toUpperCase() === 'CANCELLED') return true;
  if (ev.declined) return true;
  return false;
}

function upcoming(events, now, limit) {
  var list = (events || []).filter(function (ev) {
    if (isDeclined(ev)) return false;
    if (!ev.end) return false;
    return ev.end.getTime() >= now.getTime();
  });
  list.sort(function (a, b) {
    return a.start.getTime() - b.start.getTime();
  });
  return list.slice(0, limit || 8);
}

function happeningNow(events, now) {
  var i;
  var ev;
  for (i = 0; i < (events || []).length; i++) {
    ev = events[i];
    if (isDeclined(ev) || ev.allDay) continue;
    if (ev.start <= now && ev.end > now) return ev;
  }
  return null;
}

function nextTimed(events, now) {
  var list = upcoming(events, now, 20);
  var i;
  for (i = 0; i < list.length; i++) {
    if (!list[i].allDay) return list[i];
  }
  return list[0] || null;
}

function eventLine(ev, now) {
  var cls = 'ev ev-' + lane(ev);
  if (happeningNow([ev], now) === ev) cls += ' ev-now';
  var when;
  if (ev.allDay) {
    when = 'todo o dia';
  } else {
    when = time.formatTime(ev.start);
    if (ev.end) when += '–' + time.formatTime(ev.end);
  }
  var soon = !ev.allDay && ev.start > now && ev.start.getTime() - now.getTime() < 30 * 60 * 1000;
  if (soon) cls += ' ev-soon';
  return (
    '<div class="' +
    cls +
    '"><span class="ev-when">' +
    html.escapeHtml(when) +
    '</span><span class="ev-title">' +
    html.escapeHtml(ev.summary || '(sem título)') +
    '</span></div>'
  );
}

module.exports = {
  lane: lane,
  isTimesheet: isTimesheet,
  isDeclined: isDeclined,
  upcoming: upcoming,
  happeningNow: happeningNow,
  nextTimed: nextTimed,
  eventLine: eventLine
};
