---
layout: single
title: "Photonen-Simulator3 (Mikrofacetten + Subsurface)"
permalink: /blog/photon-sim/
classes: wide        # <- Minimal Mistakes: nutzt die volle Inhaltsbreite
author_profile: false
toc: false
sidebar: false
---

<!-- Seite lokal etwas „entfesseln“, damit der Inhalt NICHT rechts eingequetscht ist -->
<style>
/* Weite Inhaltsfläche nur auf dieser Seite öffnen */
.page__content:has(#mf-app),
.page__inner-wrap:has(#mf-app){
  max-width:none;
  padding-left:0;
  padding-right:0;
  overflow:visible; /* wichtig, sonst schneidet MM negative Margins ab */
}

/* Full-bleed Wrapper bis an den Viewportrand */
.mf-bleed{
  width:100vw;
  margin-left:calc(50% - 50vw);
  margin-right:calc(50% - 50vw);
}

/* Hauptlayout der App: zwei Spalten, links Simulation, rechts Plot/Controls */
.mf-shell{
  display:grid;
  grid-template-columns: minmax(520px, 58vw) minmax(380px, 42vw);
  grid-auto-rows: auto;
  align-items:start;
  gap:0;
  padding:0;
}

/* Mobile: untereinander */
@media (max-width: 1100px){
  .mf-shell{ grid-template-columns: 1fr; }
}

/* Kleine optische Korrekturen, falls Theme globale Abstände setzt */
.mf-shell > *{ margin:0; }

/* Optional: etwas „Luft“ um die App */
.mf-bleed{ padding: 0 0 24px; }
</style>

<!-- App-Styles (enthält die UI-Designfarben, Slider, Panels usw.) -->
<link rel="stylesheet" href="/assets/styles.css">

<div class="mf-bleed">
  <div class="mf-shell" id="mf-app">

    <!-- =============== LEFT: Canvas + Controls =============== -->
    <div id="left">
      <div class="mf-box">
        <canvas id="mf-view" class="mf-canvas" width="1600" height="1200" aria-label="Rauigkeitskasten"></canvas>
      </div>

      <div class="mf-controls">
        <div class="mf-row">
          <label for="mf-facetRes">Facet-Dichte</label>
          <input id="mf-facetRes" type="range" min="0" max="1" step="0.01" value="0.50" />
          <div id="mf-facetResVal" class="mf-val">Facets≈—</div>
        </div>
        <div class="mf-row">
          <label for="mf-rough">Rauigkeit</label>
          <input id="mf-rough" type="range" min="0" max="1" step="0.01" value="0.35" />
          <div id="mf-roughVal" class="mf-val">0.35</div>
        </div>
        <div class="mf-row">
          <label for="mf-zoom">Zoom</label>
          <input id="mf-zoom" type="range" min="1" max="6" step="0.01" value="1" />
          <div id="mf-zoomVal" class="mf-val">1.00×</div>
        </div>
        <div class="mf-row">
          <label for="mf-speed">Geschwindigkeit</label>
          <input id="mf-speed" type="range" min="10" max="2000" step="1" value="500" />
          <div id="mf-speedVal" class="mf-val">500 px/s</div>
        </div>
        <div class="mf-row">
          <label for="mf-count">Photonen (1–10000)</label>
          <input id="mf-count" type="range" min="1" max="10000" step="1" value="2000" />
          <div id="mf-countVal" class="mf-val">2000</div>
        </div>
        <div class="mf-row">
          <label for="mf-sigPara">σ∥ (entlang Achse)</label>
          <input id="mf-sigPara" type="range" min="0" max="120" step="1" value="18" />
          <div id="mf-sigParaVal" class="mf-val">18 px</div>
        </div>
        <div class="mf-row">
          <label for="mf-sigOrtho">σ⊥ (orthogonal)</label>
          <input id="mf-sigOrtho" type="range" min="0" max="120" step="1" value="9" />
          <div id="mf-sigOrthoVal" class="mf-val">9 px</div>
        </div>

        <!-- Physik-Slider -->
        <div class="mf-row">
          <label for="mf-n">n (Brechungsindex)</label>
          <input id="mf-n" type="range" min="1.05" max="3.00" step="0.01" value="1.50" />
          <div id="mf-nVal" class="mf-val">1.50</div>
        </div>
        <div class="mf-row">
          <label for="mf-a">a (Absorption)</label>
          <input id="mf-a" type="range" min="0.01" max="9.01" step="0.01" value="0.50" />
          <div id="mf-aVal" class="mf-val">0.50</div>
        </div>
        <div class="mf-row">
          <label for="mf-s">s (Streuung)</label>
          <input id="mf-s" type="range" min="0.01" max="9.01" step="0.01" value="1.00" />
          <div id="mf-sVal" class="mf-val">1.00</div>
        </div>
        <div class="mf-row">
          <label for="mf-hg">HG-g (Anisotropie)</label>
          <input id="mf-hg" type="range" min="-0.90" max="0.90" step="0.01" value="-0.45" />
          <div id="mf-hgVal" class="mf-val">-0.45</div>
        </div>

        <div class="mf-row">
          <label for="mf-detWidth">Detektor-Breite</label>
          <input id="mf-detWidth" type="range" min="10" max="800" step="1" value="200" />
          <div id="mf-detWidthVal" class="mf-val">200 px</div>
        </div>
        <div class="mf-row">
          <label for="mf-geoToggle">Geometrie-Overlay</label>
          <input id="mf-geoToggle" type="checkbox" />
          <div id="mf-geoVal" class="mf-val">Aus</div>
        </div>
        <div class="mf-row">
          <label for="mf-showSSS">SSS-Photonen (lila)</label>
          <input id="mf-showSSS" type="checkbox" checked />
          <div id="mf-showSSSVal" class="mf-val">An</div>
        </div>
        <div class="mf-row">
          <label for="mf-showRed">Reflexions-Photonen (rot)</label>
          <input id="mf-showRed" type="checkbox" checked />
          <div id="mf-showRedVal" class="mf-val">An</div>
        </div>
        <div class="mf-row">
          <label for="mf-useFresnel">Fresnel (statt 50/50)</label>
          <input id="mf-useFresnel" type="checkbox" />
          <div id="mf-useFresnelVal" class="mf-val">Aus</div>
        </div>
        <div class="mf-row">
          <label>Fresnel R<sub>s</sub> (%)</label>
          <div class="mf-val" id="fresnelOut">—</div>
          <div class="mf-val"></div>
        </div>

        <div class="btnRow">
          <button id="btnPlay" class="primary">⏸︎ Pause</button>
          <button id="btnReset">Reset</button>
          <span style="color:#6b7c8f">[Leertaste = Play/Pause]</span>
        </div>
      </div>
    </div>

    <!-- =============== RIGHT: Histogram Panel =============== -->
    <div id="right">
      <div class="panel">
        <canvas id="histCanvas" width="820" height="360"></canvas>
        <div class="legendRow" style="margin-top:10px">
          <span class="chip"><span class="swatch sw-red"></span>Rot aktiv: <span id="cntRed">0</span></span>
          <span class="chip"><span class="swatch sw-sss"></span>Lila aktiv: <span id="cntSSS">0</span></span>
          <span class="chip"><span class="swatch sw-total"></span>Summe: <span id="cntTotal">0</span></span>
        </div>
      </div>

      <div class="panel rightControls">
        <div class="rightRow">
          <label>Kurven</label>
          <div style="display:flex; gap:16px; align-items:center">
            <label><input type="checkbox" id="chkRed" checked /> Rot</label>
            <label><input type="checkbox" id="chkSSS" checked /> Lila</label>
            <label><input type="checkbox" id="chkTotal" checked /> Summe</label>
          </div>
          <div class="val"></div>
        </div>

        <div class="rightRow">
          <label>Darstellung</label>
          <select id="modeGraph">
            <option value="both" selected>Roh + Smooth</option>
            <option value="raw">nur Roh</option>
            <option value="smooth">nur Smooth</option>
          </select>
          <div class="val"></div>
        </div>

        <div class="rightRow">
          <label>Smooth-Fenster</label>
          <input id="smoothSlider" type="range" min="3" max="101" step="2" value="21" />
          <div id="smoothVal" class="val">21</div>
        </div>

        <div class="rightRow">
          <label>Zoom (ziehen)</label>
          <div class="legendRow" style="gap:8px">
            <button id="btnZoomReset">Reset</button>
            <span style="color:#6b7c8f">Drag im Plot zum Zoomen (Kasten)</span>
          </div>
          <div class="val"></div>
        </div>
      </div>
    </div>

  </div>
</div>

<!-- Skripte (müssen auf /assets liegen, damit GitHub Pages sie findet) -->
<script src="/assets/engine.js"></script>
<script src="/assets/app.js"></script>
