/* app.js – UI/Plot/Glue
   Erwartet: engine.js stellt window.MFSim bereit (Klasse) */

(function(){
  const $ = (id)=>document.getElementById(id);
  const getCss=(name)=>getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  // --- Elements (nur die, die app.js wirklich braucht) ---
  const simCanvas = $('mf-view');
  const histCanvas = $('histCanvas');

  // Linke Seite – Slider/Checkboxen
  const roughEl = $('mf-rough');
  const roughValEl = $('mf-roughVal');
  const facetResEl = $('mf-facetRes');
  const facetResValEl = $('mf-facetResVal');
  const zoomEl = $('mf-zoom');
  const zoomValEl = $('mf-zoomVal');
  const speedEl = $('mf-speed');
  const speedValEl = $('mf-speedVal');
  const countEl = $('mf-count');
  const countValEl = $('mf-countVal');
  const sigParaEl = $('mf-sigPara');
  const sigParaValEl = $('mf-sigParaVal');
  const sigOrthoEl = $('mf-sigOrtho');
  const sigOrthoValEl = $('mf-sigOrthoVal');
  const detWidthEl = $('mf-detWidth');
  const detWidthValEl = $('mf-detWidthVal');

  const geoToggleEl = $('mf-geoToggle');
  const geoValEl = $('mf-geoVal');
  const showSSSEl = $('mf-showSSS');
  const showSSSValEl = $('mf-showSSSVal');
  const showRedEl = $('mf-showRed');
  const showRedValEl = $('mf-showRedVal');

  const nEl = $('mf-n'); const nValEl = $('mf-nVal');
  const aEl = $('mf-a'); const aValEl = $('mf-aVal');
  const sEl = $('mf-s'); const sValEl = $('mf-sVal');
  const useFresnelEl = $('mf-useFresnel'); const useFresnelValEl = $('mf-useFresnelVal');

  const btnPlay = $('btnPlay');
  const btnReset = $('btnReset');

  // Rechte Seite – Plot-Controls
  const chkRed = $('chkRed');
  const chkSSS = $('chkSSS');
  const chkTotal = $('chkTotal');
  const modeGraph = $('modeGraph');
  const smoothSlider = $('smoothSlider');
  const smoothVal = $('smoothVal');
  const btnZoomReset = $('btnZoomReset');

  const cntRedEl = $('cntRed');
  const cntSSSEl = $('cntSSS');
  const cntTotalEl = $('cntTotal');

  // Optionales Bin-Info-Element (falls vorhanden)
  const binInfoEl = $('binInfo');

  // --- Simulation instanzieren ---
  if(!window.MFSim){
    console.error('[app] MFSim (engine.js) nicht gefunden.');
    return;
  }
  const sim = new MFSim(simCanvas);
  console.log('[engine] MFSim exportiert:', !!sim);

  // --- ResizeObserver für die resizable Simulationsbox ---
  const simBox = document.querySelector('.mf-box');
  if (window.ResizeObserver && simBox){
    const ro = new ResizeObserver(()=>{
      sim.fitDPI();        // passt backing store an
      sim.resetWave(true); // gleiche Zeit/Statistik beibehalten
      sim.draw();          // sofortiges Redraw (auch bei Pause)
    });
    ro.observe(simBox);
  }

  // --- Plot Canvas DPI & Zustand ---
  const hctx = histCanvas.getContext('2d');
  function fitPlotDPI(){
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = histCanvas.clientWidth, h = histCanvas.clientHeight;
    histCanvas.width = Math.round(w*dpr);
    histCanvas.height = Math.round(h*dpr);
    hctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener('resize', fitPlotDPI);
  fitPlotDPI();

  // --- Plot Zustand / Zoom ---
  const BIN_DT = 0.05;                  // s pro Bin
  let view = { xmin:0, xmax:6, ymin:0, ymax:10 };
  let drag = null; // {x0,y0,x1,y1}

  function resetPlotWindow(){
    view.xmin = 0;
    const tx = (sim && isFinite(sim.tSim)) ? sim.tSim : 0;
    view.xmax = Math.max(6, tx + 0.5);
    view.ymin = 0;
    view.ymax = Math.max(10, view.ymax||10);
  }
  function ensurePlotWindow(){
    const ok = isFinite(view.xmin) && isFinite(view.xmax) && (view.xmax > view.xmin + 1e-6);
    if (!ok) resetPlotWindow();
    if (!isFinite(view.ymin) || !isFinite(view.ymax) || view.ymax <= view.ymin + 1e-6){
      view.ymin = 0; view.ymax = Math.max(10, view.ymax||10);
    }
  }

  btnZoomReset?.addEventListener('click', resetPlotWindow);

  // --- Histogramm-Helfer ---
  function buildBins(times, tmin, tmax, dt){
    // Robuste Guards gegen ungültige Fenster/Parameter
    if (!Array.isArray(times)) return [];
    if (!isFinite(tmin) || !isFinite(tmax) || !isFinite(dt) || dt <= 0) return [];
    const span = tmax - tmin;
    if (!(span > 0)) return [];
    // Maximal erlaubte Bins, sonst Invalid array length
    const MAX_BINS = 20000;
    const n = Math.min(MAX_BINS, Math.max(1, Math.ceil(span/dt)));
    const bins = new Array(n).fill(0);
    for(const t of times){
      if (!isFinite(t)) continue;
      if (t < tmin || t > tmax) continue;
      let idx = Math.floor((t - tmin)/dt);
      if (idx < 0) idx = 0;
      if (idx >= n) idx = n-1;
      bins[idx] += 1;
    }
    return bins;
  }
  function gaussianKernel(n,sigma){
    const k=[],mid=(n-1)/2; let s=0;
    for(let i=0;i<n;i++){ const x=i-mid, w=Math.exp(-0.5*(x*x)/(sigma*sigma)); k.push(w); s+=w; }
    for(let i=0;i<n;i++) k[i]/=s; return k;
  }
  function smoothArray(arr,win){
    if(!Array.isArray(arr) || arr.length===0) return [];
    if(win<3) return arr.slice(); if(win%2===0) win+=1;
    const sigma=win/6, ker=gaussianKernel(win,sigma), out=new Array(arr.length).fill(0), mid=(win-1)/2;
    for(let i=0;i<arr.length;i++){
      let acc=0;
      for(let j=0;j<win;j++){
        let idx=i+j-mid; if(idx<0) idx=0; if(idx>=arr.length) idx=arr.length-1;
        acc+=arr[idx]*ker[j];
      }
      out[i]=acc;
    }
    return out;
  }

  // --- Plot zeichnen ---
  function drawHistogram(){
    ensurePlotWindow();

    const w = histCanvas.clientWidth, h = histCanvas.clientHeight;
    hctx.clearRect(0,0,w,h);

    // Daten holen (sim exportiert red/sss als Arrays)
    const hitRed = sim.hitsRed || (sim.hits && sim.hits.red) || [];
    const hitSSS = sim.hitsSSS || (sim.hits && sim.hits.sss) || [];

    const tmin = view.xmin, tmax = view.xmax, dt = BIN_DT;
    const red = buildBins(hitRed, tmin, tmax, dt);
    const sss = buildBins(hitSSS, tmin, tmax, dt);
    const total = (red.length ? red : sss).map((_,i)=> (red[i]||0) + (sss[i]||0));

    // y-Auto-Skala, wenn kein Benutzer-Y-Zoom aktiv:
    const yMaxAuto = Math.max(1, ...(total.length? total : [1]));
    // nur leicht anheben, nicht verkleinern (verhindert Pumpen)
    view.ymax = Math.max(view.ymax, yMaxAuto);

    // Achsen & Grid
    const pad = {l:42, r:12, t:10, b:34};
    const plotW = Math.max(1, w - pad.l - pad.r);
    const plotH = Math.max(1, h - pad.t - pad.b);
    const xScale = plotW/Math.max(1e-6,(tmax-tmin));
    const yScale = plotH/Math.max(1, (view.ymax - view.ymin));

    // Grid (vertikal/horizontal)
    hctx.strokeStyle = getCss('--grid') || '#e4e7eb';
    hctx.lineWidth = 1;

    function niceStep(span, maxTicks){
      if (!isFinite(span) || span <= 0) return 1;
      const raw = span / Math.max(1, maxTicks);
      const pow = Math.pow(10, Math.floor(Math.log10(raw)));
      const frac = raw / pow;
      let nice;
      if (frac <= 1) nice = 1;
      else if (frac <= 2) nice = 2;
      else if (frac <= 5) nice = 5;
      else nice = 10;
      return nice * pow;
    }
    const xSpan = (tmax - tmin), ySpan = (view.ymax - view.ymin);
    const xStep = niceStep(xSpan, 8), yStep = niceStep(ySpan, 6);

    // Vertikale Grid + x-Ticks
    hctx.beginPath();
    if (isFinite(xStep) && xStep > 0){
      for(let x = Math.ceil(tmin/xStep)*xStep; x <= tmax+1e-9; x += xStep){
        const px = pad.l + (x - tmin)*xScale;
        hctx.moveTo(px, pad.t);
        hctx.lineTo(px, pad.t + plotH);
      }
    }
    hctx.stroke();

    // Horizontale Grid + y-Ticks
    hctx.beginPath();
    if (isFinite(yStep) && yStep > 0){
      for(let y = Math.ceil(view.ymin/yStep)*yStep; y <= view.ymax+1e-9; y += yStep){
        const py = pad.t + plotH - (y - view.ymin)*yScale;
        hctx.moveTo(pad.l, py);
        hctx.lineTo(pad.l + plotW, py);
      }
    }
    hctx.stroke();

    // Achsen
    hctx.strokeStyle = '#9aa3ad';
    hctx.lineWidth = 1.4;
    // x-Achse
    hctx.beginPath();
    hctx.moveTo(pad.l, pad.t + plotH + 0.5);
    hctx.lineTo(pad.l + plotW, pad.t + plotH + 0.5);
    hctx.stroke();
    // y-Achse
    hctx.beginPath();
    hctx.moveTo(pad.l - 0.5, pad.t);
    hctx.lineTo(pad.l - 0.5, pad.t + plotH);
    hctx.stroke();

    // Tick Labels
    hctx.fillStyle = '#445';
    hctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
    // x
    hctx.textAlign = 'center';
    hctx.textBaseline = 'top';
    if (isFinite(xStep) && xStep > 0){
      for(let x = Math.ceil(tmin/xStep)*xStep; x <= tmax+1e-9; x += xStep){
        const px = pad.l + (x - tmin)*xScale;
        hctx.fillText(x.toFixed(2), px, pad.t + plotH + 6);
      }
    }
    // y
    hctx.textAlign = 'right';
    hctx.textBaseline = 'middle';
    if (isFinite(yStep) && yStep > 0){
      for(let y = Math.ceil(view.ymin/yStep)*yStep; y <= view.ymax+1e-9; y += yStep){
        const py = pad.t + plotH - (y - view.ymin)*yScale;
        hctx.fillText(String(Math.round(y)), pad.l - 6, py);
      }
    }

    // Achsenbeschriftungen
    hctx.save();
    // X label
    hctx.fillStyle = '#223';
    hctx.font = 'bold 12px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
    hctx.textAlign = 'right';
    hctx.fillText('Zeit (s)', pad.l + plotW, pad.t + plotH + 22);
    // Y label (gedreht)
    hctx.translate(12, pad.t + plotH/2);
    hctx.rotate(-Math.PI/2);
    hctx.textAlign = 'center';
    hctx.fillText('Anzahl / Bin', 0, 0);
    hctx.restore();

    // Linienzeichner
    function plotLine(arr, color, lw=3, dash=null){
      if (!Array.isArray(arr) || arr.length===0) return;
      hctx.save();
      hctx.beginPath();
      hctx.lineWidth = lw;
      hctx.strokeStyle = color;
      if (dash) hctx.setLineDash(dash);
      let first=true;
      for(let i=0;i<arr.length;i++){
        const x = tmin + i*dt;
        const y = arr[i];
        const px = pad.l + (x - tmin)*xScale;
        const py = pad.t + plotH - (y - view.ymin)*yScale;
        if(first){ hctx.moveTo(px,py); first=false; } else { hctx.lineTo(px,py); }
      }
      hctx.stroke();
      hctx.restore();
    }

    // Modus & Anzeige
    const mode = modeGraph ? modeGraph.value : 'both';
    const win = smoothSlider ? parseInt(smoothSlider.value||'21',10) : 21;
    if (smoothVal) smoothVal.textContent = String(win);

    const kred = smoothArray(red,win), ksss=smoothArray(sss,win), ktot=smoothArray(total,win);
    const colRed = getCss('--photon-reflect') || '#ff5d2a';
    const colSSS = getCss('--photon-sss') || '#8a2be2';
    const colTot = getCss('--total') || '#111';

    if (mode !== 'smooth'){
      if (chkRed?.checked)   plotLine(red,  colRed,  2.4, null);
      if (chkSSS?.checked)   plotLine(sss,  colSSS,  2.4, null);
      if (chkTotal?.checked) plotLine(total, colTot, 2.4, null);
    }
    if (mode !== 'raw'){
      if (chkRed?.checked)   plotLine(kred,  colRed,  3.0, [6,4]);
      if (chkSSS?.checked)   plotLine(ksss,  colSSS,  3.0, [6,4]);
      if (chkTotal?.checked) plotLine(ktot,  colTot,  3.0, [6,4]);
    }

    // Zählchips updaten
    cntRedEl && (cntRedEl.textContent = (hitRed?.length||0));
    cntSSSEl && (cntSSSEl.textContent = (hitSSS?.length||0));
    cntTotalEl && (cntTotalEl.textContent = ( (hitRed?.length||0) + (hitSSS?.length||0) ));

    // Bin-Info (falls vorhanden)
    if (binInfoEl){
      binInfoEl.textContent = `Bin = ${(BIN_DT*1000)|0} ms`;
    }

    // Drag-Zoom Overlay (falls aktiv)
    if (drag){
      const x0 = Math.min(drag.x0, drag.x1);
      const x1 = Math.max(drag.x0, drag.x1);
      const y0 = Math.min(drag.y0, drag.y1);
      const y1 = Math.max(drag.y0, drag.y1);
      hctx.save();
      hctx.fillStyle='rgba(13,110,253,0.15)';
      hctx.fillRect(x0,y0,x1-x0,y1-y0);
      hctx.strokeStyle='rgba(13,110,253,0.6)';
      hctx.lineWidth=2;
      hctx.strokeRect(x0+0.5,y0+0.5,(x1-x0)-1,(y1-y0)-1);
      hctx.restore();
    }
  }

  // Maus-Zoom (sichtbarer Kasten, korrekt unter Maus)
  histCanvas.addEventListener('mousedown', (e)=>{
    const r = histCanvas.getBoundingClientRect();
    drag = { x0:e.clientX - r.left, y0:e.clientY - r.top, x1:e.clientX - r.left, y1:e.clientY - r.top };
  });
  window.addEventListener('mousemove', (e)=>{
    if(!drag) return;
    const r = histCanvas.getBoundingClientRect();
    drag.x1 = Math.max(0, Math.min(histCanvas.clientWidth, e.clientX - r.left));
    drag.y1 = Math.max(0, Math.min(histCanvas.clientHeight, e.clientY - r.top));
  });
  window.addEventListener('mouseup', ()=>{
    if(!drag) return;
    const w = histCanvas.clientWidth, h = histCanvas.clientHeight;

    const pad = {l:42, r:12, t:10, b:34};
    const plotW = Math.max(1, w - pad.l - pad.r);
    const plotH = Math.max(1, h - pad.t - pad.b);

    // Clip auf Plotbereich
    const x0 = Math.max(pad.l, Math.min(pad.l+plotW, Math.min(drag.x0, drag.x1)));
    const x1 = Math.max(pad.l, Math.min(pad.l+plotW, Math.max(drag.x0, drag.x1)));
    const y0 = Math.max(pad.t, Math.min(pad.t+plotH, Math.min(drag.y0, drag.y1)));
    const y1 = Math.max(pad.t, Math.min(pad.t+plotH, Math.max(drag.y0, drag.y1)));

    // Mindestgröße, sonst ignorieren
    if ((x1 - x0) > 6 && (y1 - y0) > 6){
      const xFrac0 = (x0 - pad.l)/Math.max(1, plotW);
      const xFrac1 = (x1 - pad.l)/Math.max(1, plotW);
      const yFrac0 = (y0 - pad.t)/Math.max(1, plotH);
      const yFrac1 = (y1 - pad.t)/Math.max(1, plotH);

      const newXmin = view.xmin + (view.xmax - view.xmin)*xFrac0;
      const newXmax = view.xmin + (view.xmax - view.xmin)*xFrac1;
      const newYmax = view.ymin + (view.ymax - view.ymin)*(1 - yFrac0);
      const newYmin = view.ymin + (view.ymax - view.ymin)*(1 - yFrac1);

      if (isFinite(newXmin) && isFinite(newXmax) && newXmax > newXmin + 0.05){
        view.xmin = newXmin;
        view.xmax = Math.max(view.xmin + 0.5, newXmax);
      }
      if (isFinite(newYmin) && isFinite(newYmax) && newYmax > newYmin + 0.5){
        view.ymin = Math.max(0, Math.min(newYmin, newYmax - 1));
        view.ymax = Math.max(view.ymin + 1, Math.max(newYmin, newYmax));
      }
    }

    drag = null;
  });

  // --- Play/Pause & Reset ---
  let isPlaying = true;
  btnPlay && btnPlay.addEventListener('click', ()=>{
    isPlaying = !isPlaying;
    btnPlay.textContent = isPlaying ? '⏸︎ Pause' : '▶︎ Play';
    btnPlay.classList.toggle('primary', isPlaying);
  });
  window.addEventListener('keydown', (e)=>{
    if(e.code==='Space'){
      e.preventDefault();
      isPlaying = !isPlaying;
      btnPlay && (btnPlay.textContent = isPlaying ? '⏸︎ Pause' : '▶︎ Play');
      btnPlay && btnPlay.classList.toggle('primary', isPlaying);
    }
  });
  btnReset && btnReset.addEventListener('click', ()=>{
    sim.resetWave(false);
    resetPlotWindow();
  });

  // --- UI → Simulation Bindings ---
  function bindRange(el, valEl, fmt, onChange){
    if(!el) return;
    const update=(commit=false)=>{
      const v = parseFloat(el.value);
      if(valEl) valEl.textContent = fmt ? fmt(v) : String(v);
      onChange && onChange(v, commit);
    };
    el.addEventListener('input', ()=>update(false));
    el.addEventListener('change', ()=>update(true));
    update(true);
  }
  function bindCheck(el, valEl, onChange){
    if(!el) return;
    const update=()=>{
      if(valEl) valEl.textContent = el.checked ? 'An' : 'Aus';
      onChange && onChange(el.checked);
    };
    el.addEventListener('change', update); update();
  }

  bindRange(roughEl, roughValEl, v=>v.toFixed(2), (v)=>{ sim.rough = v; sim.resetWave(true); });
  bindRange(facetResEl, facetResValEl, v=>{
    try{
      const est = sim.estimateFacets(v);
      return 'Facets≈' + est;
    }catch(_){ return String(v); }
  }, (v)=>{ sim.facetRes = v; sim.resetWave(true); });

  bindRange(zoomEl,  zoomValEl,  v=>v.toFixed(2)+'×', (v)=>{ sim.zoom = v; sim.draw(); });
  bindRange(speedEl, speedValEl, v=>Math.round(v)+' px/s', (v)=>{ sim.speedAir = v; });
  bindRange(countEl, countValEl, v=>String(v|0), (v)=>{ sim.pCount = v|0; sim.resetWave(true); });
  bindRange(sigParaEl, sigParaValEl, v=>Math.round(v)+' px', (v)=>{ sim.sigPara=v; sim.resetWave(true); });
  bindRange(sigOrthoEl, sigOrthoValEl, v=>Math.round(v)+' px', (v)=>{ sim.sigOrtho=v; sim.resetWave(true); });
  bindRange(detWidthEl, detWidthValEl, v=>Math.round(v)+' px', (v)=>{ sim.detWidth=v; sim.draw(); });

  bindRange(nEl, nValEl, v=>v.toFixed(2), (v)=>{ sim.nMat=v; sim.draw(); });
  bindRange(aEl, aValEl, v=>v.toFixed(2), (v)=>{ sim.aCoeff=v; });
  bindRange(sEl, sValEl, v=>v.toFixed(2), (v)=>{ sim.sCoeff=v; });

  bindCheck(geoToggleEl, geoValEl, (c)=>{ sim.showGeo = c; sim.draw(); });
  bindCheck(showSSSEl, showSSSValEl, (c)=>{ sim.showSSS = c; });
  bindCheck(showRedEl,  showRedValEl,  (c)=>{ sim.showRed  = c; });
  bindCheck(useFresnelEl, useFresnelValEl, (c)=>{ sim.useFresnel = c; });

  // Rechts: Plot-Schalter
  chkRed && chkRed.addEventListener('change', drawHistogram);
  chkSSS && chkSSS.addEventListener('change', drawHistogram);
  chkTotal && chkTotal.addEventListener('change', drawHistogram);
  modeGraph && modeGraph.addEventListener('change', drawHistogram);
  smoothSlider && smoothSlider.addEventListener('input', drawHistogram);

  // --- RAF Loops (Sim + Plot) ---
  let last = 0;
  function rafSim(ts){
    if(!last) last = ts;
    const dt = Math.min(0.05, (ts - last)/1000);
    last = ts;

    if (isPlaying){
      if (typeof sim.tick === 'function') sim.tick(dt);
      else if (typeof sim.update === 'function') sim.update(dt);
      else if (typeof sim.step === 'function') sim.step(dt);
      sim.draw();
      // Plotfenster automatisch mitlaufen lassen
      if (isFinite(sim.tSim) && (sim.tSim > view.xmax - 0.25)) view.xmax = sim.tSim + 0.25;
    } else {
      sim.draw();
    }
    requestAnimationFrame(rafSim);
  }
  function rafPlot(){
    drawHistogram();
    requestAnimationFrame(rafPlot);
  }

  // --- Start ---
  sim.fitDPI();
  sim.resetWave(false);
  resetPlotWindow();
  requestAnimationFrame(rafSim);
  requestAnimationFrame(rafPlot);

  // Falls Engine eine Fresnel-Preview melden kann (Emitter drag), höre darauf
  window.addEventListener('mf:fresnelPreview', ()=>{ drawHistogram(); });

})();

