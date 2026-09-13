/* ES3 — iOS 5 Safari. No const/let/arrow/fetch. */
(function () {
  var pauseUntil = 0;
  var nextLink = document.getElementById("linkNext");
  var prevZone = document.getElementById("zonePrev");
  var nextZone = document.getElementById("zoneNext");

  function nowMs() {
    return new Date().getTime();
  }

  function flash(el) {
    if (!el) return;
    el.className = el.className + " flash";
    setTimeout(function () {
      el.className = el.className.replace(" flash", "");
    }, 100);
  }

  function onTap(el) {
    if (!el) return;
    el.ontouchend = function () {
      pauseUntil = nowMs() + 120000;
      flash(el);
    };
  }

  onTap(prevZone);
  onTap(nextZone);

  setInterval(function () {
    if (!nextLink || !nextLink.href) return;
    if (nowMs() < pauseUntil) return;
    window.location.href = nextLink.href;
  }, 75000);
})();
