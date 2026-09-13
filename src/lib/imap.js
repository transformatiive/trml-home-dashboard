"use strict";

var tls = require("tls");

function isNoise(from, subject) {
  var s = ((from || "") + " " + (subject || "")).toLowerCase();
  var needles = [
    "notify.railway",
    "noreply",
    "no-reply",
    "mailer-daemon",
    "notifications@",
    "zoho.com",
    "atlassian.net",
    "google-workspace",
    "viaverde",
    "workspace-noreply",
  ];
  var i;
  for (i = 0; i < needles.length; i++) {
    if (s.indexOf(needles[i]) !== -1) return true;
  }
  return false;
}

function quote(s) {
  return '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
}

function parseHeaders(raw) {
  var text = String(raw || "").replace(/\r\n[ \t]/g, " ");
  var from = "";
  var subject = "";
  text.split(/\r?\n/).forEach(function (line) {
    if (/^from:/i.test(line)) from = line.replace(/^from:\s*/i, "");
    if (/^subject:/i.test(line)) subject = line.replace(/^subject:\s*/i, "");
  });
  return { from: from, subject: subject };
}

function imapConnect(opts) {
  return new Promise(function (resolve, reject) {
    var socket = tls.connect(
      {
        host: opts.host,
        port: opts.port,
        servername: opts.host,
      },
      function () {
        resolve(socket);
      }
    );
    socket.setEncoding("utf8");
    socket.setTimeout(15000);
    socket.on("timeout", function () {
      socket.destroy();
      reject(new Error("IMAP timeout"));
    });
    socket.on("error", reject);
  });
}

function readUntil(socket, token) {
  return new Promise(function (resolve, reject) {
    var buf = "";
    function onData(chunk) {
      buf += chunk;
      if (buf.indexOf(token) !== -1) {
        cleanup();
        resolve(buf);
      }
    }
    function onErr(err) {
      cleanup();
      reject(err);
    }
    function cleanup() {
      socket.removeListener("data", onData);
      socket.removeListener("error", onErr);
    }
    socket.on("data", onData);
    socket.on("error", onErr);
  });
}

async function fetchEmailMeter() {
  var user = process.env.EMAIL_IMAP_USER || "";
  var pass = process.env.EMAIL_IMAP_PASS || "";
  if (!user || !pass) {
    return { configured: false, total: 0, unseen: 0, people: [], noise: 0 };
  }
  var host = process.env.EMAIL_IMAP_HOST || "imap.gmail.com";
  var port = Number(process.env.EMAIL_IMAP_PORT || 993);
  var box = process.env.EMAIL_IMAP_MAILBOX || "INBOX";
  var socket = await imapConnect({ host: host, port: port });
  try {
    await readUntil(socket, "OK");
    socket.write("a1 LOGIN " + quote(user) + " " + quote(pass) + "\r\n");
    var login = await readUntil(socket, "a1 ");
    if (!/a1 OK/i.test(login)) throw new Error("IMAP login failed");
    socket.write("a2 SELECT " + quote(box) + "\r\n");
    var select = await readUntil(socket, "a2 ");
    var exists = 0;
    var unseen = 0;
    var em = /(\d+) EXISTS/.exec(select);
    if (em) exists = Number(em[1]);
    socket.write("a3 STATUS " + quote(box) + " (MESSAGES UNSEEN)\r\n");
    var status = await readUntil(socket, "a3 ");
    var um = /UNSEEN[ ]+(\d+)/i.exec(status);
    var mm = /MESSAGES[ ]+(\d+)/i.exec(status);
    if (um) unseen = Number(um[1]);
    if (mm) exists = Number(mm[1]);
    socket.write("a4 SEARCH UNSEEN\r\n");
    var search = await readUntil(socket, "a4 ");
    var ids = [];
    var sm = /\* SEARCH[ ]?([^\r\n]*)/i.exec(search);
    if (sm && sm[1].trim()) {
      ids = sm[1].trim().split(/\s+/).map(Number).filter(Boolean).slice(-20);
    }
    var people = [];
    var noise = 0;
    var i;
    for (i = 0; i < ids.length; i++) {
      socket.write("aF" + i + " FETCH " + ids[i] + " (BODY.PEEK[HEADER.FIELDS (FROM SUBJECT)])\r\n");
      var fetched = await readUntil(socket, "aF" + i + " ");
      var headers = parseHeaders(fetched);
      if (isNoise(headers.from, headers.subject)) noise += 1;
      else if (people.length < 3 && headers.subject) people.push(headers);
    }
    socket.write("a9 LOGOUT\r\n");
    try { await readUntil(socket, "a9 "); } catch (e) {}
    return { configured: true, total: exists, unseen: unseen, people: people, noise: noise };
  } finally {
    socket.destroy();
  }
}

module.exports = { fetchEmailMeter: fetchEmailMeter, isNoise: isNoise };
