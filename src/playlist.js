"use strict";

var agora = require("./plugins/agora");
var calendar = require("./plugins/calendar");
var weather = require("./plugins/weather");
var power = require("./plugins/power");
var sun = require("./plugins/sun");
var warnings = require("./plugins/warnings");
var email = require("./plugins/email");
var publico = require("./plugins/publico");
var daysleft = require("./plugins/daysleft");

var PLUGINS = [agora, calendar, weather, power, sun, warnings, email, publico, daysleft];

function byId(id) {
  var i;
  for (i = 0; i < PLUGINS.length; i++) {
    if (PLUGINS[i].id === id) return { plugin: PLUGINS[i], index: i };
  }
  return { plugin: PLUGINS[0], index: 0 };
}

function href(index) {
  var p = PLUGINS[(index + PLUGINS.length) % PLUGINS.length];
  return "/p/" + p.id;
}

module.exports = {
  PLUGINS: PLUGINS,
  byId: byId,
  href: href,
};
