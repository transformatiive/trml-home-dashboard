'use strict';

var fs = require('fs');
var path = require('path');

var DIR = path.join(__dirname, '..', 'data');
var SNAP = path.join(DIR, 'snapshot.json');

function ensure() {
  if (!fs.existsSync(DIR)) {
    fs.mkdirSync(DIR, { recursive: true });
  }
}

function load() {
  try {
    ensure();
    if (!fs.existsSync(SNAP)) return null;
    return JSON.parse(fs.readFileSync(SNAP, 'utf8'));
  } catch (e) {
    return null;
  }
}

function save(obj) {
  try {
    ensure();
    var tmp = SNAP + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(obj));
    fs.renameSync(tmp, SNAP);
  } catch (e) {
    /* keep last good file */
  }
}

module.exports = { load: load, save: save, DIR: DIR };
