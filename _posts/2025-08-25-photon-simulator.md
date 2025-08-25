---
layout: single
title: "Photonen-Simulator · Mikrofacetten + Detektor"
excerpt: "Interaktive Web-App direkt im Post, vollbreit"
classes: wide        # Minimal Mistakes breiter Content
toc: false
author_profile: false
mathjax: false
---

<style>
/* ===== Full-bleed Wrapper, berührt die Ränder ===== */
.mm-bleed {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
}

/* ===== App-Scope: nichts global (kein body) ===== */
:root{
  --mf-air:#87CEEB;      /* Luft */
  --mf-mat:#b99b71;      /* Material */
  --mf-line:#1c2a38;     /* Interface */
  --mf-accent:#2f81f7;
  --mf-muted:#6b7c8f;
  --photon-reflect:#ff5d2a;  /* rot */
  --photon-sss:#8a2be2;      /* lila */
  --mf-emitter:#00bcd4;      /* Emitter */
  --ovl-plane:#6b5cff;       /* lila Linie */
  --ovl-in:#00bcd4;          /* cyan Linie */
  --ovl-arc:#202939;         /* Winkelbogen */
  --ovl-fit:#2ecc71;         /* grün */
  --detector:#f0b93a;        /* Detektor */
  --total:#111;              /* Summenkurve */
}

/* Root der App – nix global anfassen */
.mm-sim {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(420px, 1fr) minmax(520px, 46vw);
  gap: 0;
  align-items: start;
  background: #fff;
  color: #2b3645;
  padding: 0;
}

/* Linke Seite */
.mm-sim #left{
  display:flex; flex-direction:column; align-items:center; gap:12px;
  padding:14px 16px;
}
.mm-sim .mf-box{ width:min(160mm, 95%); height:120mm; position:relative; }
.mm-sim .mf-canvas{ width:100%; height:100%; display:block; border-radius:10px; box-shadow:0 12px 38px rgba(0,0,0,.12); background:transparent; }

.mm-sim .mf-controls{ display:grid; gap:8px; width:min(160mm, 95%); }
.mm-sim .mf-row{ display:grid; grid-template-columns: 180px minmax(0,1fr) 140px; align-items:center; gap:10px; }
.mm-sim .mf-row label{ color:var(--mf-muted); font-weight:700; white-space:nowrap }
.mm-sim .mf-val{ justify-self:end; color:var(--mf-accent); font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
.mm-sim input[type=range]{ -webkit-appearance:none; width:100%; height:6px; border-radius:999px; background:#d0d7de; outline:none; cursor:pointer }
.mm-sim input[type=range]::-webkit-slider-thumb{ -webkit-appearance:none; width:16px; height:16px; border-radius:50%; background:var(--mf-accent); box-shadow:0 0 0 3px rgba(47,129,247,.18) }
.mm-sim input[type=checkbox]{ width:18px; height:18px; }
.mm-sim .btnRow{ display:flex; gap:8px; align-items:center; }
.mm-sim button{ appearance:none; border:1px solid #d5dbe0; background:#fff; border-radius:8px; padding:8px 12px; font-weight:600; cursor:pointer; box-shadow:0 1px 2px rgba(0,0,0,.04) }
.mm-sim button:hover{ background:#f2f5f8 }
.mm-sim .primary{ background:#0d6efd; color:#fff; border-color:#0d6efd }
.mm-sim .primary:hover{ background:#0b5ed7 }

/* Rechte Seite */
.mm-sim #right{
  display:flex; flex-direction:column; background:#eef2f6; padding:16px; gap:14px; overflow:hidden;
  border-left:1px solid #e4e7eb;
}
.mm-sim .panel{ background:#fff; border:1px solid #e4e7eb; border-radius:12px; box-shadow:0 10px 24px rgba(0,0,0,.10); padding:14px }
.mm-sim #histCanvas{ width:100%; height:360px; border-radius:10px; border:1px solid #e4e7eb; background:#fff; display:block }
.mm-sim .legendRow{ display:flex; flex-wrap:wrap; gap:12px; align-items:center; }
.mm-sim .chip{ padding:2px 6px; border-radius:999px; background:#f2f5f8; border:1px solid #e4e7eb; font-weight:700 }
.mm-sim .swatch{ display:inline-block; width:12px; height:12px; border-radius:3px; margin-right:6px; vertical-align:middle }
.mm-sim .sw-red{ background: var(--photon-reflect) }
.mm-sim .sw-sss{ background: var(--photon-sss) }
.mm-sim .sw-total{ background: var(--total) }
.mm-sim .rightControls{ display:grid; gap:10px }
.mm-sim .rightRow{ display:grid; grid-template-columns: 140px 1fr 140px; align-items:center; gap:10px }
.mm-sim .rightRow .val{ text-align:right; font-weight:800; color:#0d6efd }
.mm-sim .rightRow input[type=checkbox]{ width:18px; height:18px; }
.mm-sim .rightRow select{ padding:6px 10px; border-radius:8px; border:1px solid #d5dbe0; background:#fff; font-weight:600 }

/* Vollbreit auf kleinen Screens: Stapeln */
@media (max-width: 1100px){
  .mm-sim { grid-template-columns: 1fr; }
  .mm-sim #right { border-left: none; }
}

/* Optional: App oben/unten vom Theme etwas absetzen */
.mm-sim { margin: 0; }
.mm-bleed + .page__comments { margin-top: 1rem; }
</style>

<div class="mm-bleed">
  <div class="mm-sim" id="mf-app">
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
          <label for="mf-hg">HG-g</label>
          <input id="mf-hg" type="range" min="-0.95" max="0.95" step="0.01" value="-0.45" />
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

        <!-- Live-Fresnel-Ausgabe -->
        <div class="mf-row">
          <label>Fresnel R<sub>s</sub> (%)</label>
          <div class="mf-val" id="fresnelVal">—</div>
          <div class="mf-val" style="opacity:.65">θ & n,a abhängig</div>
        </div>

        <div class="btnRow">
          <button id="btnPlay" class="primary">⏸︎ Pause</button>
          <button id="btnReset">Reset</button>
          <span style="color:#6b7c8f">[Leertaste = Play/Pause]</span>
        </div>
      </div>
    </div>

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
          <div id="smoothVal" class="mf-val">21</div>
        </div>

        <div class="rightRow">
          <label>Zoom (ziehen)</label>
          <div class="legendRow" style="gap:8px">
            <button id="btnZoomReset">Reset</button>
            <span style="color:#6b7c8f">Drag im Plot = Zoom</span>
          </div>
          <div class="val"></div>
        </div>

        <div class="rightRow">
          <label>Bin-Breite</label>
          <div id="binInfo" class="mf-val">— s</div>
          <div class="val"></div>
        </div>
      </div>
    </div>
  </div>
</div>

<noscript><p><strong>Bitte JavaScript aktivieren</strong>, um die Simulation zu sehen.</p></noscript>

<!-- App-Skripte vom Repo -->
<script src="{{ '/assets/engine.js' | relative_url }}"></script>
<script src="{{ '/assets/app.js' | relative_url }}"></script>
