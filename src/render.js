"use strict";

function escapeHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attr(str) {
  return escapeHtml(str);
}

function wrap(opts) {
  var theme = opts.theme || "night";
  var title = opts.title || "LG Dash";
  var prevHref = opts.prevHref || "/";
  var nextHref = opts.nextHref || "/";
  var body = opts.body || "";
  var rotate = opts.rotateHint !== false;
  var qs = opts.qs || "";
  var prev = attr(prevHref + qs);
  var next = attr(nextHref + qs);

  return (
    "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n" +
    "<html xmlns=\"http://www.w3.org/1999/xhtml\" lang=\"pt\">\n" +
    "<head>\n" +
    "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n" +
    "<meta http-equiv=\"refresh\" content=\"120\" />\n" +
    "<meta name=\"apple-mobile-web-app-capable\" content=\"yes\" />\n" +
    "<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black-translucent\" />\n" +
    "<meta name=\"apple-mobile-web-app-title\" content=\"LG Dash\" />\n" +
    "<meta name=\"format-detection\" content=\"telephone=no\" />\n" +
    "<meta name=\"viewport\" content=\"width=1024, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no\" />\n" +
    "<link rel=\"apple-touch-icon\" sizes=\"57x57\" href=\"/icons/apple-touch-icon-57.png\" />\n" +
    "<link rel=\"apple-touch-icon\" sizes=\"72x72\" href=\"/icons/apple-touch-icon-72.png\" />\n" +
    "<link rel=\"stylesheet\" type=\"text/css\" href=\"/screen.css\" />\n" +
    "<title>" +
    escapeHtml(title) +
    "</title>\n" +
    "</head>\n" +
    "<body class=\"theme-" +
    attr(theme) +
    "\">\n" +
    (rotate ? "<div class=\"rotate\">Rode o iPad para landscape.</div>\n" : "") +
    "<div id=\"stage\" class=\"stage\">\n" +
    "<div class=\"canvas\">\n" +
    body +
    "\n</div>\n" +
    "<a class=\"zone zone-prev\" id=\"zonePrev\" href=\"" +
    prev +
    "\">&nbsp;</a>\n" +
    "<a class=\"zone zone-next\" id=\"zoneNext\" href=\"" +
    next +
    "\">&nbsp;</a>\n" +
    "<a id=\"linkNext\" href=\"" +
    next +
    "\">&nbsp;</a>\n" +
    "</div>\n" +
    "<script type=\"text/javascript\" src=\"/client.js\"></script>\n" +
    "</body>\n</html>\n"
  );
}

module.exports = { escapeHtml: escapeHtml, attr: attr, wrap: wrap };
