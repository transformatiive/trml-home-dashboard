'use strict';

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function attrClass(list) {
  return list.filter(Boolean).join(' ');
}

module.exports = { escapeHtml: escapeHtml, attrClass: attrClass };
