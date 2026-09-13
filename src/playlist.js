'use strict';

var PLUGINS = [
  { id: 'agora', name: 'Agora' },
  { id: 'calendar', name: 'Calendário' },
  { id: 'weather', name: 'Meteorologia' },
  { id: 'warnings', name: 'Avisos' },
  { id: 'email', name: 'Email' },
  { id: 'publico', name: 'Público' },
  { id: 'daysleft', name: 'Dias' }
];

function normalizeIndex(n) {
  var len = PLUGINS.length;
  var i = ((n % len) + len) % len;
  return i;
}

function at(n) {
  return PLUGINS[normalizeIndex(n)];
}

function prevIndex(n) {
  return normalizeIndex(n - 1);
}

function nextIndex(n) {
  return normalizeIndex(n + 1);
}

module.exports = {
  PLUGINS: PLUGINS,
  normalizeIndex: normalizeIndex,
  at: at,
  prevIndex: prevIndex,
  nextIndex: nextIndex
};
