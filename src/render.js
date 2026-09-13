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
  var pluginName = opts.pluginName || "";
  var index = opts.index || 1;
  var total = opts.total || 7;
  var prevHref = opts.prevHref || "/";
  var nextHref = opts.nextHref || "/";
  var sky = opts.sky || "";
  var updated = opts.updated || "";
  var body = opts.body || "";
  var rotate = opts.rotateHint !== false;
  var qs = opts.qs || "";

  return (
    "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n" +
    "<html xmlns=\"http://www.w3.org/1999/xhtml\" lang=\"pt\">\n" +
    "<head>\n" +
    "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n" +
    "<meta http-equiv=\"refresh\" content=\"120\" />\n" +
    "<meta name=\"apple-mobile-web-app-capable\" content=\"yes\" />\n" +
    "<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black\" />\n" +
    "<meta name=\"apple-mobile-web-app-title\" content=\"LG Dash\" />\n" +
    "<meta name=\"viewport\" content=\"width=1024, height=768, initial-scale=1, maximum-scale=1, user-scalable=no\" />\n" +
    "<link rel=\"apple-touch-icon\" sizes=\"57x57\" href=\"/icons/apple-touch-icon-57.png\" />\n" +
    "<link rel=\"apple-touch-icon\" sizes=\"72x72\" href=\"/icons/apple-touch-icon-72.png\" />\n" +
    "<link rel=\"stylesheet\" type=\"text/css\" href=\"/screen.css\" />\n" +
    "<title>" +
    escapeHtml(title) +
    "</title>\n" +
    "</head>\n" +
    "<body class=\"theme-" +
    attr(theme) +
    (sky ? " sky-" + attr(sky) : "") +
    "\">\n" +
    (rotate ? "<div class=\"rotate\">Rode o iPad para landscape.</div>\n" : "") +
    "<table class=\"shell\" width=\"1024\" height=\"768\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n" +
    "<tr>\n" +
    "<td class=\"zone zone-prev\" id=\"zonePrev\" width=\"123\" height=\"768\" valign=\"middle\">" +
    "<a class=\"zone-link\" id=\"linkPrev\" href=\"" +
    attr(prevHref + qs) +
    "\">&nbsp;</a></td>\n" +
    "<td class=\"stage\" id=\"stage\" width=\"778\" height=\"768\" valign=\"top\">\n" +
    body +
    "\n</td>\n" +
    "<td class=\"zone zone-next\" id=\"zoneNext\" width=\"123\" height=\"768\" valign=\"middle\">" +
    "<a class=\"zone-link\" id=\"linkNext\" href=\"" +
    attr(nextHref + qs) +
    "\">&nbsp;</a></td>\n" +
    "</tr>\n" +
    "</table>\n" +
    "<div class=\"hint\" id=\"hint\">" +
    escapeHtml(String(index)) +
    " / " +
    escapeHtml(String(total)) +
    " · " +
    escapeHtml(pluginName) +
    (updated ? " · " + escapeHtml(updated) : "") +
    "</div>\n" +
    "<script type=\"text/javascript\" src=\"/client.js\"></script>\n" +
    "</body>\n</html>\n"
  );
}

module.exports = { escapeHtml: escapeHtml, attr: attr, wrap: wrap };
