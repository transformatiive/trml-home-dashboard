"use strict";

var agora = require("./plugins/agora");
var calendar = require("./plugins/calendar");
var weather = require("./plugins/weather");
var sun = require("./plugins/sun");
var publico = require("./plugins/publico");
var ar = require("./plugins/ar");
var openrouter = require("./plugins/openrouter");
var daysleft = require("./plugins/daysleft");
var power = require("./plugins/power");
var warnings = require("./plugins/warnings");
var email = require("./plugins/email");

var PLUGINS = [
  agora,
  calendar,
  weather,
  sun,
  publico,
  daysleft,
  power,
  warnings,
  email,
];

var EXTRA = [ar, openrouter];

function lookup(list, id) {
  var i;
  for (i = 0; i < list.length; i++) {
    if (list[i].id === id) return i;
  }
  return -1;
}

function byId(id) {
  var index = lookup(PLUGINS, id);
  if (index !== -1) return { plugin: PLUGINS[index], index: index };
  index = lookup(EXTRA, id);
  if (index !== -1) return { plugin: EXTRA[index], index: 0, extra: true };
  return { plugin: PLUGINS[0], index: 0 };
}

function href(index) {
  var p = PLUGINS[(index + PLUGINS.length) % PLUGINS.length];
  return "/p/" + p.id;
}

module.exports = {
  PLUGINS: PLUGINS,
  EXTRA: EXTRA,
  byId: byId,
  href: href,
};
