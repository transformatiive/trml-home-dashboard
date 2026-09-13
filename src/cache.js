"use strict";

var fs = require("fs");
var path = require("path");

var DIR = process.env.FRAME_DIR || path.join(__dirname, "..", "data", "frames");

function ensure() {
  fs.mkdirSync(DIR, { recursive: true });
}

function framePath(id) {
  return path.join(DIR, id + ".json");
}

function save(id, payload) {
  ensure();
  var body = JSON.stringify(
    {
      savedAt: new Date().toISOString(),
      payload: payload,
    },
    null,
    0
  );
  fs.writeFileSync(framePath(id), body, "utf8");
}

function load(id) {
  try {
    var raw = fs.readFileSync(framePath(id), "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

module.exports = { save: save, load: load, DIR: DIR };
