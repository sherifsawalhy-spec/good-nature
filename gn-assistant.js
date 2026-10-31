/*
 * Good Nature Assistant — floating chat button for the Good Nature apps.
 * Each GN app includes it with <script src=".../gn-assistant.js" data-app="Name" defer>.
 * Computer: opens the chat as a side panel over the app. Phone: opens the chat full screen
 * (Back returns to the app).
 */
(function () {
  if (window.__gnAssistant) return; window.__gnAssistant = 1;
  var URL = 'https://script.google.com/macros/s/AKfycbxV9oClpwrqq_-cv_IqHXO_FXvzUgRP6LvNITwuW96MCvgJ8XVRxOmum7qFQ5xSw2Gxyg/exec';
  var me = document.currentScript || document.querySelector('script[src*="gn-assistant.js"]');
  var app = (me && me.getAttribute('data-app')) || String(document.title || '').replace(/^(GN|Good Nature)\s+/i, '').replace(/\s*[-–—|].*$/, '').trim();
  if (/^Good Nature Assistant$/i.test(document.title)) return;   // never inside the assistant itself
  var mobile = window.matchMedia('(max-width: 700px)').matches || /iPhone|Android.+Mobile/.test(navigator.userAgent);
  var link = URL + '?app=' + encodeURIComponent(app);

  var css = '.vqa-btn{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:2147483000;width:54px;height:54px;border-radius:50%;border:0;cursor:pointer;' +
    'background:#86593d;color:#fff;box-shadow:0 6px 18px rgba(60,40,25,.3);display:flex;align-items:center;justify-content:center;transition:transform .12s}' +
    '.vqa-btn:hover{transform:scale(1.06)}.vqa-btn svg{width:26px;height:26px}' +
    '.vqa-btn.has-bar{bottom:calc(78px + env(safe-area-inset-bottom))}' +
    '.vqa-panel{position:fixed;top:0;right:0;bottom:0;width:min(440px,100vw);z-index:2147483001;background:#f4f6f9;box-shadow:-8px 0 30px rgba(0,0,0,.25);transform:translateX(105%);transition:transform .2s ease;display:flex;overscroll-behavior:contain}' +
    '.vqa-panel.open{transform:none}.vqa-panel iframe{border:0;width:100%;height:100%}' +
    '.vqa-x{position:absolute;top:12px;left:-40px;width:34px;height:34px;border-radius:50%;border:0;background:#86593d;color:#fff;font-size:18px;line-height:34px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.25);display:none}' +
    '.vqa-panel.open .vqa-x{display:block}' +
    '@media print{.vqa-btn,.vqa-panel{display:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var b = document.createElement('button');
  b.className = 'vqa-btn'; b.type = 'button'; b.title = 'Ask the Good Nature Assistant / اسأل المساعد'; b.setAttribute('aria-label', 'Good Nature Assistant');
  b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></svg>';

  // keep clear of any bar fixed to the bottom of the screen (tab bars, action bars): sit just above it
  function lift() {
    b.style.bottom = '';
    var r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    b.style.visibility = 'hidden';
    var el = document.elementFromPoint(x, y), top = null;
    b.style.visibility = '';
    while (el && el !== document.body && el !== document.documentElement) {
      var cs = getComputedStyle(el);
      if (cs.position === 'fixed' || cs.position === 'sticky') {
        var er = el.getBoundingClientRect();
        if (er.height < window.innerHeight / 2 && er.bottom >= window.innerHeight - 40) top = er.top;
        break;
      }
      el = el.parentElement;
    }
    if (top !== null) b.style.bottom = Math.round(window.innerHeight - top + 10) + 'px';
  }

  // pass this page's light/dark choice so the chat looks the same (it can't read it itself inside a frame)
  function themeQ() {
    var t = document.documentElement.getAttribute('data-theme');
    if (!t) { try { t = localStorage.getItem('vqTheme'); } catch (e) { } }
    return (t === 'light' || t === 'dark') ? '&theme=' + t : '';
  }
  // the person's own account (GN apps set GN_USER; the home page keeps it in S.st.email) — avoids the
  // "no permission" error when several Google accounts are signed in on the same browser
  function userQ() { var u = ''; try { u = window.GN_USER || (window.S && S.st && S.st.email) || ''; } catch (e) { } return /@/.test(u) ? '&authuser=' + encodeURIComponent(u) : ''; }
  var panel = null;
  function openPanel() {
    if (mobile) { window.top.location.href = link + userQ(); return; }   // full screen on phones
    if (!panel) {
      panel = document.createElement('div'); panel.className = 'vqa-panel';
      var f = document.createElement('iframe'); f.src = link + '&embed=1' + userQ(); f.allow = 'clipboard-write';
      var x = document.createElement('button'); x.type = 'button'; x.className = 'vqa-x'; x.title = 'Close'; x.setAttribute('aria-label', 'Close assistant'); x.innerHTML = '&#10005;';
      x.onclick = function () { closePanel(); };
      panel.appendChild(x); panel.appendChild(f); document.body.appendChild(panel);
      // if the chat cannot load inside the app (browser blocks sign-in in frames), open it in a new tab instead
      var loaded = false; f.onload = function () { loaded = true; };
      setTimeout(function () { if (!loaded) { closePanel(); window.open(link + userQ(), '_blank'); } }, 12000);
    }
    lockPage(true);
    requestAnimationFrame(function () { panel.classList.add('open'); });
  }
  // while the chat is open the page behind it stays still, so scrolling only moves the chat
  var saved = null;
  function lockPage(on) {
    var h = document.documentElement, bd = document.body;
    if (on && saved === null) { saved = [h.style.overflow, bd.style.overflow]; h.style.overflow = 'hidden'; bd.style.overflow = 'hidden'; }
    else if (!on && saved !== null) { h.style.overflow = saved[0]; bd.style.overflow = saved[1]; saved = null; }
  }
  function closePanel() { if (panel) panel.classList.remove('open'); lockPage(false); }
  b.onclick = function () { panel && panel.classList.contains('open') ? closePanel() : openPanel(); };
  window.addEventListener('message', function (e) {
    var d = (e && e.data) || {};
    if (d.gnAssistant === 'close') closePanel();
    if (d.gnAssistant === 'full') { closePanel(); window.open(link + userQ(), '_blank'); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });

  function mount() { document.body.appendChild(b); lift(); [600, 1500, 4000].forEach(function (t) { setTimeout(lift, t); }); window.addEventListener('resize', lift); document.addEventListener('click', function () { setTimeout(lift, 300); }, true); }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
