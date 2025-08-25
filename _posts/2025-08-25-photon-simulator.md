---
layout: single
title: "Photonen-Simulator"
date: 2025-08-25
classes: wide
author_profile: false
toc: false
---

> Diese Seite startet die interaktive Web-App in einem **eigenen Fenster**.  
> Stelle sicher, dass deine App unter **`/test/`** liegt (also `test/index.html`) und die Assets unter **`/assets/`** (`styles.css`, `engine.js`, `app.js`).

<div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center; margin: 10px 0 18px;">
  <button class="btn btn--primary" onclick="(function(){
    var base='{{ site.baseurl }}' || '';
    // Popup-Fenster (größenveränderbar)
    window.open(base + '/test/', 'PhotonSim',
      'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes');
  })()">
    👉 Web-App im Fenster öffnen
  </button>

  <a class="btn" href="{{ site.baseurl }}/test/" target="_blank" rel="noopener">
    In neuem Tab öffnen
  </a>

  <a class="btn" href="{{ site.baseurl }}/test/">
    Im selben Tab öffnen
  </a>
</div>

---

### Hinweise
- Wenn dein GitHub Pages Projekt eine **Base-URL** nutzt (z.B. `/blog`), wird sie automatisch über `{{ site.baseurl }}` berücksichtigt.
- Falls die App leer erscheint: einmal **hart neu laden** (Ctrl/Cmd + Shift + R), damit keine alten Caches stören.
- Die Web-App selbst liegt **außerhalb** des Blog-Layouts (unter `/test/`) und nutzt dadurch den **gesamten Bildschirmplatz**.
