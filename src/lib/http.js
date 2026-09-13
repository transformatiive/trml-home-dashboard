"use strict";

var TIME = 20000;
var UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15";

async function request(url, opts) {
  opts = opts || {};
  var ac = new AbortController();
  var t = setTimeout(function () {
    ac.abort();
  }, opts.timeout || TIME);
  var headers = {
    "User-Agent": UA,
    Accept: opts.accept || "application/json, application/rss+xml, application/xml, text/xml, */*",
  };
  if (opts.headers) {
    Object.keys(opts.headers).forEach(function (k) {
      headers[k] = opts.headers[k];
    });
  }
  try {
    var res = await fetch(url, {
      signal: ac.signal,
      method: opts.method || "GET",
      headers: headers,
      body: opts.body,
    });
    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }
    return res;
  } finally {
    clearTimeout(t);
  }
}

async function getText(url, opts) {
  var res = await request(url, opts);
  return await res.text();
}

async function getJson(url, opts) {
  var text = await getText(url, opts);
  return JSON.parse(text);
}

async function postForm(url, fields, opts) {
  opts = opts || {};
  var body = Object.keys(fields)
    .map(function (k) {
      return encodeURIComponent(k) + "=" + encodeURIComponent(fields[k] == null ? "" : fields[k]);
    })
    .join("&");
  var headers = Object.assign(
    { "Content-Type": "application/x-www-form-urlencoded" },
    opts.headers || {}
  );
  var res = await request(url, {
    method: "POST",
    headers: headers,
    body: body,
    accept: opts.accept,
    timeout: opts.timeout,
  });
  return JSON.parse(await res.text());
}

module.exports = {
  request: request,
  getText: getText,
  getJson: getJson,
  postForm: postForm,
};
