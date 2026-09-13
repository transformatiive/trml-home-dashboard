"use strict";

var ics = require("./ics");
var assert = require("node:assert/strict");
var test = require("node:test");

test("parses timed and all-day events, skips cancelled", function () {
  var raw =
    "BEGIN:VCALENDAR\n" +
    "X-WR-CALNAME:TRANSFORMATIIVE\n" +
    "BEGIN:VEVENT\n" +
    "SUMMARY:Passear o cão\n" +
    "DTSTART;TZID=Europe/Lisbon:20260913T080000\n" +
    "DTEND;TZID=Europe/Lisbon:20260913T083000\n" +
    "END:VEVENT\n" +
    "BEGIN:VEVENT\n" +
    "SUMMARY:Feriado\n" +
    "DTSTART;VALUE=DATE:20260913\n" +
    "END:VEVENT\n" +
    "BEGIN:VEVENT\n" +
    "SUMMARY:Meetup\n" +
    "STATUS:CANCELLED\n" +
    "DTSTART;TZID=Europe/Lisbon:20260913T190000\n" +
    "END:VEVENT\n" +
    "END:VCALENDAR\n";
  var parsed = ics.parseIcs(raw);
  assert.equal(parsed.name, "TRANSFORMATIIVE");
  assert.equal(parsed.events.length, 3);
  assert.equal(parsed.events[0].summary, "Passear o cão");
  assert.equal(parsed.events[1].start.allDay, true);
  assert.equal(ics.isDeclined(parsed.events[2]), true);
});

test("declined attendee is filtered", function () {
  var parsed = ics.parseIcs(
    "BEGIN:VEVENT\nSUMMARY:Lenny\nDTSTART:20260913T180000Z\nATTENDEE;PARTSTAT=DECLINED:mailto:nbarreto@transformatiive.com\nEND:VEVENT\n"
  );
  assert.equal(ics.isDeclined(parsed.events[0], "nbarreto@transformatiive.com"), true);
});
