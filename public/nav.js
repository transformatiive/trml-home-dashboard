function flashZone(el) {
  var base = 'zone';
  el.className = 'zone flash';
  window.setTimeout(function () {
    el.className = base;
  }, 110);
}

function bindTap(id, href) {
  var el = document.getElementById(id);
  if (!el) {
    return;
  }
  function go(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    flashZone(el);
    window.setTimeout(function () {
      window.location.href = href;
    }, 90);
    pauseAdvance();
  }
  el.onclick = go;
  el.ontouchend = go;
}

var autoTimer = null;
var AUTO_MS = 75000;
var PAUSE_MS = 120000;

function scheduleAdvance(ms) {
  if (autoTimer) {
    window.clearTimeout(autoTimer);
  }
  autoTimer = window.setTimeout(function () {
    window.location.href = NEXT_HREF;
  }, ms);
}

function pauseAdvance() {
  scheduleAdvance(PAUSE_MS);
}

bindTap('zone-prev', PREV_HREF);
bindTap('zone-next', NEXT_HREF);
scheduleAdvance(AUTO_MS);
