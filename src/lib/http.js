"use strict";

var TIME = 20000;

async function getText(url) {
  var ac = new AbortController();
  var t = setTimeout(function () {
    ac.abort();
  }, TIME);
  try {
    var res = await fetch(url, {
      signal: ac.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
    });
    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

async function getJson(url) {
  var text = await getText(url);
  return JSON.parse(text);
}

module.exports = { getText: getText, getJson: getJson };
