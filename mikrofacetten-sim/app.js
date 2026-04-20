/* app.js — UI, Controls (nur noch Simulation) */
(function(){
  const canvas = document.getElementById('mf-view');
  const uiContainer = document.getElementById('uiContainer');
  const toggleUiBtn = document.getElementById('toggleUiBtn');

  // Controls (Selektoren unverändert)
  const facetResEl = document.getElementById('mf-facetRes');
  const facetResValEl = document.getElementById('mf-facetResVal');
  const roughEl = document.getElementById('mf-rough');
  const roughValEl = document.getElementById('mf-roughVal');
  const zoomEl = document.getElementById('mf-zoom');
  const zoomValEl = document.getElementById('mf-zoomVal');
  const speedEl = document.getElementById('mf-speed');
  const speedValEl = document.getElementById('mf-speedVal');
  const countEl = document.getElementById('mf-count');
  const countValEl = document.getElementById('mf-countVal');
  const autoStopEl = document.getElementById('mf-autoStop');
  const stopTimeEl = document.getElementById('mf-stopTime');
  const radiusEl = document.getElementById('mf-radius');
  const radiusValEl = document.getElementById('mf-radiusVal');
  const sigParaEl = document.getElementById('mf-sigPara');
  const sigParaValEl = document.getElementById('mf-sigParaVal');
  const sigOrthoEl = document.getElementById('mf-sigOrtho');
  const sigOrthoValEl = document.getElementById('mf-sigOrthoVal');
  const nEl = document.getElementById('mf-n');
  const nValEl = document.getElementById('mf-nVal');

  const aEl = document.getElementById('mf-a');
  const aValEl = document.getElementById('mf-aVal');
  const sEl = document.getElementById('mf-s');
  const sValEl = document.getElementById('mf-sVal');

  const hgEl = document.getElementById('mf-hg');
  const hgValEl = document.getElementById('mf-hgVal');
  const detWidthEl = document.getElementById('mf-detWidth');
  const detWidthValEl = document.getElementById('mf-detWidthVal');
  const geoToggleEl = document.getElementById('mf-geoToggle');
  const geoValEl = document.getElementById('mf-geoVal');
  const showSSSEl = document.getElementById('mf-showSSS');
  const showRedEl = document.getElementById('mf-showRed');
  const showRedValEl = document.getElementById('mf-showRedVal');
  const useFresnelEl = document.getElementById('mf-useFresnel');
  const useFresnelValEl = document.getElementById('mf-useFresnelVal');
  const hideReentryEl = document.getElementById('mf-hideReentry');

  const showDetEl = document.getElementById('mf-showDet');
  const showDetValEl = document.getElementById('mf-showDetVal');

  const btnPlay = document.getElementById('btnPlay');
  const btnSnapshot = document.getElementById('btnSnapshot');
  const btnSvg = document.getElementById('btnSvg');
  const btnReset = document.getElementById('btnReset');

  const rhoMEl = document.getElementById('mf-rhoM');
  const rhoMValEl = document.getElementById('mf-rhoMVal');

  // Histogram controls
  const binSizeEl = document.getElementById('mf-binSize');
  const binSizeValEl = document.getElementById('mf-binSizeVal');
  const histSplineEl = document.getElementById('hist-showSpline');
  const histSplineValEl = document.getElementById('hist-showSplineVal');
  const histSmoothEl = document.getElementById('hist-smooth');
  const histSmoothValEl = document.getElementById('hist-smoothVal');
  const histCombinedEl = document.getElementById('hist-combined');
  const histCombinedValEl = document.getElementById('hist-combinedVal');
  const histNormalizeEl = document.getElementById('hist-normalize');
  const histNormalizeValEl = document.getElementById('hist-normalizeVal');
  const btnHistSave = document.getElementById('btnHistSave');
  const btnHistClear = document.getElementById('btnHistClear');

  if(!window.MFSim){ console.error('MFSim (engine.js) nicht geladen.'); }
  const engine = new MFSim(canvas);
  const histogram = new HistogramChart('histogram-canvas', 'histogram-stats');

  // Patterson drag → sync µₛ slider
  engine._onPattersonDrag = function(newSCoeff){
    const pos = Math.log(newSCoeff / 0.01) / Math.log(1000);
    sEl.value = Math.max(0, Math.min(100, pos * 100));
    sValEl.textContent = newSCoeff.toFixed(2);
  };

  // Detector drag (Patterson) → sync ρₘ slider
  engine._onDetectorDrag = function(newRhoM){
    if(rhoMEl){ rhoMEl.value = newRhoM; rhoMValEl.textContent = Math.round(newRhoM)+' px'; }
  };

  facetResValEl.textContent = 'Facets≈' + engine.updateFacetEstimate();

  // --- Mode switching ---
  const MODE_VISIBILITY = {
    laserscanner:      { hide: ['row-rhoM'], show: ['row-sigOrtho','row-sigPara'] },
    material_impulse:  { hide: ['row-sigOrtho','row-sigPara','row-rhoM'], show: [] },
    patterson:         { hide: ['row-sigOrtho','row-sigPara'], show: ['row-rhoM'] }
  };

  function applyModeVisibility(mode){
    const vis = MODE_VISIBILITY[mode];
    if(!vis) return;
    ['row-sigOrtho','row-sigPara','row-rhoM'].forEach(id=>{
      const el = document.getElementById(id);
      if(el) el.style.display = '';
    });
    vis.hide.forEach(id=>{
      const el = document.getElementById(id);
      if(el) el.style.display = 'none';
    });
  }

  function syncSlidersToParams(){
    sigOrthoEl.value = engine.params.sigOrtho; sigOrthoValEl.textContent = Math.round(engine.params.sigOrtho)+' px';
    sigParaEl.value = engine.params.sigPara; sigParaValEl.textContent = Math.round(engine.params.sigPara)+' px';
    detWidthEl.value = engine.params.detWidth; detWidthValEl.textContent = Math.round(engine.params.detWidth)+' px';
    showDetEl.checked = engine.params.showDet; showDetValEl.textContent = engine.params.showDet?'On':'Off';
    if(rhoMEl){ rhoMEl.value = engine.params.rhoM; rhoMValEl.textContent = Math.round(engine.params.rhoM)+' px'; }
    roughEl.value = engine.params.rough; roughValEl.textContent = parseFloat(engine.params.rough).toFixed(2);
  }

  function applyModeToHistogram(mode){
    histogram.setUseInnerPath(mode === 'material_impulse');
    histogram.reset();
  }

  document.querySelectorAll('input[name="simMode"]').forEach(radio=>{
    radio.addEventListener('change', ()=>{
      engine.setMode(radio.value);
      applyModeVisibility(radio.value);
      applyModeToHistogram(radio.value);
      syncSlidersToParams();
    });
  });

  // Initial visibility
  applyModeVisibility('laserscanner');

  function getLogValue(sliderVal) {
      const minLog = 0.01; const maxLog = 10.0;
      const position = parseFloat(sliderVal) / 100.0;
      return minLog * Math.pow(maxLog / minLog, position);
  }

  // UI Toggle Logic
  function toggleUI() {
      uiContainer.classList.toggle('ui-minimized');
      toggleUiBtn.textContent = uiContainer.classList.contains('ui-minimized') ? '\u25C0' : '\u25B6';
  }
  if(toggleUiBtn) toggleUiBtn.addEventListener('click', toggleUI);

  // Listeners — simulation
  facetResEl.addEventListener('input', ()=>{ engine.setParam('facetRes', parseFloat(facetResEl.value)); facetResValEl.textContent = 'Facets\u2248' + engine.updateFacetEstimate(); });
  roughEl.addEventListener('input', ()=>{ engine.setParam('rough', parseFloat(roughEl.value)); roughValEl.textContent=roughEl.value; histogram.reset(); });
  zoomEl.addEventListener('input', ()=>{ engine.setParam('zoom', parseFloat(zoomEl.value)); zoomValEl.textContent=zoomEl.value+'\u00d7'; });
  speedEl.addEventListener('input', ()=>{ engine.setParam('speedAir', parseFloat(speedEl.value)); speedValEl.textContent=Math.round(speedEl.value)+' px/s'; });
  autoStopEl.addEventListener('change', ()=>{ engine.setParam('autoStop', autoStopEl.checked); });
  stopTimeEl.addEventListener('input', ()=>{ engine.setParam('stopTime', parseFloat(stopTimeEl.value)); });
  countEl.addEventListener('input', ()=>{ engine.setParam('pCount', parseInt(countEl.value,10)); countValEl.textContent=countEl.value; facetResValEl.textContent = 'Facets\u2248' + engine.updateFacetEstimate(); });
  radiusEl.addEventListener('input', ()=>{ engine.setParam('radius', parseFloat(radiusEl.value)); radiusValEl.textContent = parseFloat(radiusEl.value).toFixed(1) + ' px'; });
  sigParaEl.addEventListener('input', ()=>{ engine.setParam('sigPara', parseFloat(sigParaEl.value)); sigParaValEl.textContent=Math.round(sigParaEl.value)+' px'; });
  sigOrthoEl.addEventListener('input', ()=>{ engine.setParam('sigOrtho', parseFloat(sigOrthoEl.value)); sigOrthoValEl.textContent=Math.round(sigOrthoEl.value)+' px'; });
  nEl.addEventListener('input', ()=>{ engine.setParam('nMat', parseFloat(nEl.value)); nValEl.textContent = parseFloat(nEl.value).toFixed(2); histogram.reset(); });

  aEl.addEventListener('input', ()=>{ const val = getLogValue(aEl.value); engine.setParam('aCoeff', val); aValEl.textContent = val.toFixed(2); histogram.reset(); });
  sEl.addEventListener('input', ()=>{ const val = getLogValue(sEl.value); engine.setParam('sCoeff', val); sValEl.textContent = val.toFixed(2); histogram.reset(); });

  hgEl.addEventListener('input', ()=>{ engine.setParam('hg', parseFloat(hgEl.value)); hgValEl.textContent = parseFloat(hgEl.value).toFixed(2); histogram.reset(); });
  detWidthEl.addEventListener('input', ()=>{ engine.setParam('detWidth', parseFloat(detWidthEl.value)); detWidthValEl.textContent = Math.round(detWidthEl.value) + ' px'; histogram.reset(); });
  if(rhoMEl) rhoMEl.addEventListener('input', ()=>{ engine.setParam('rhoM', parseFloat(rhoMEl.value)); rhoMValEl.textContent = Math.round(rhoMEl.value)+' px'; histogram.reset(); });
  geoToggleEl.addEventListener('change', ()=>{ engine.setParam('showGeo', geoToggleEl.checked); geoValEl.textContent= geoToggleEl.checked?'On':'Off'; });

  showDetEl.addEventListener('change', ()=>{ engine.setParam('showDet', showDetEl.checked); showDetValEl.textContent= showDetEl.checked?'On':'Off'; });

  showSSSEl.addEventListener('change', ()=>{ engine.setParam('showSSS', showSSSEl.checked); });
  hideReentryEl.addEventListener('change', ()=>{ engine.setParam('hideReentry', hideReentryEl.checked); });
  showRedEl.addEventListener('change', ()=>{ engine.setParam('showRed', showRedEl.checked); showRedValEl.textContent= showRedEl.checked?'On':'Off'; });
  useFresnelEl.addEventListener('change', ()=>{ engine.setParam('useFresnel', useFresnelEl.checked); useFresnelValEl.textContent= useFresnelEl.checked?'On':'Off'; histogram.reset(); });

  // Histogram controls
  if(binSizeEl) binSizeEl.addEventListener('input', ()=>{ const v = Math.max(1, parseFloat(binSizeEl.value)); histogram.setBinSize(v); binSizeValEl.textContent = Math.round(v)+' px'; });
  if(histSplineEl) histSplineEl.addEventListener('change', ()=>{ histogram.showSpline = histSplineEl.checked; histSplineValEl.textContent = histSplineEl.checked?'On':'Off'; });
  if(histSmoothEl) histSmoothEl.addEventListener('input', ()=>{ histogram.splineTension = parseFloat(histSmoothEl.value); histSmoothValEl.textContent = parseFloat(histSmoothEl.value).toFixed(2); });
  if(histCombinedEl) histCombinedEl.addEventListener('change', ()=>{ histogram.showCombined = histCombinedEl.checked; histCombinedValEl.textContent = histCombinedEl.checked?'On':'Off'; });
  if(histNormalizeEl) histNormalizeEl.addEventListener('change', ()=>{ histogram.normalize = histNormalizeEl.checked; histNormalizeValEl.textContent = histNormalizeEl.checked?'On':'Off'; });
  if(btnHistSave) btnHistSave.addEventListener('click', ()=>{ histogram.saveSnapshot(); });
  if(btnHistClear) btnHistClear.addEventListener('click', ()=>{ engine.resetWave(false); histogram.clearAll(); });

  // Chart mode radio
  document.querySelectorAll('input[name="histMode"]').forEach(radio=>{
    radio.addEventListener('change', ()=>{ histogram.setChartMode(radio.value); });
  });

  // Reset: clears both simulation and histogram
  btnReset.addEventListener('click', ()=>{ engine.resetWave(false); });
  btnPlay.addEventListener('click', ()=>{ const p=!engine.isPlaying; engine.setPlaying(p); btnPlay.textContent = p? '\u23F8\uFE0E Pause':'\u25B6\uFE0E Play'; btnPlay.classList.toggle('primary', p); });
  btnSnapshot.addEventListener('click', ()=>{ engine.exportHighRes(6); });

  btnSvg.addEventListener('click', ()=>{
      if(!window.SVGContext) return alert("SVG Exporter not loaded.");
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      const svgCtx = new window.SVGContext(w, h);
      engine.draw(svgCtx);
      const svgString = svgCtx.getSerializedSvg();
      const blob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = "simulation-vector.svg"; link.click();
  });

  window.addEventListener('keydown', (e)=>{
    if(e.code==='Space'){ e.preventDefault(); const p=!engine.isPlaying; engine.setPlaying(p); btnPlay.textContent = p? '\u23F8\uFE0E Pause':'\u25B6\uFE0E Play'; btnPlay.classList.toggle('primary', p); }
    if(e.code==='KeyR'){ engine.resetWave(false); histogram.clearAll(); }
    if(e.code==='KeyH'){ toggleUI(); }
  });

  function getRGBA(prefix){
      const r = document.getElementById(prefix+'-r').value;
      const g = document.getElementById(prefix+'-g').value;
      const b = document.getElementById(prefix+'-b').value;
      const a = document.getElementById(prefix+'-a').value;
      return `rgba(${r},${g},${b},${a})`;
  }
  document.getElementById('btnSetMat').addEventListener('click', ()=>{ engine.setColor('mat', getRGBA('c-mat')); });
  document.getElementById('btnSetAir').addEventListener('click', ()=>{ engine.setColor('air', getRGBA('c-air')); });
  document.getElementById('btnSetFit').addEventListener('click', ()=>{ engine.setColor('ovlFit', getRGBA('c-fit')); });
  document.getElementById('btnSetSSS').addEventListener('click', ()=>{ engine.setColor('sss', getRGBA('c-sss')); });

  // --- Animation loop with histogram accumulation ---
  let lastTS=0, histFrame=0;
  let lastWaveSignal=0;

  function rafSim(ts){
    if(!lastTS) lastTS=ts;
    const dt=Math.min(0.05, (ts-lastTS)/1000);
    lastTS=ts;

    engine.step(dt);
    engine.draw();

    // Detect wave resets via engine signal counter
    const sig = engine._waveSignal||0;
    if(sig !== lastWaveSignal){
      histogram.onWaveReset(engine.hitsRed.length, engine.hitsSSS.length);
      lastWaveSignal = sig;
    }

    // Soll = 2× actual beam path from emitter to surface intersection (= black line × 2)
    if(engine.params.mode === 'laserscanner' && engine.emitter.y != null && engine.cachedPoly){
      const H = canvas.clientHeight;
      const xSurf = engine.xAtY(engine.cachedPoly, H / 2);
      const dx = xSurf - engine.emitter.x;
      const dy = H / 2 - engine.emitter.y;
      histogram.nominalDist = 2 * Math.sqrt(dx * dx + dy * dy);
    } else {
      histogram.nominalDist = null;
    }

    // Feed new hits + redraw (throttled)
    histogram.ingest(engine.hitsRed, engine.hitsSSS);
    if(++histFrame % 6 === 0) histogram.draw();

    const playing = engine.getIsPlaying();
    const btnIsPause = btnPlay.textContent.includes('Pause');
    if(btnIsPause !== playing){
         btnPlay.textContent = playing ? '\u23F8\uFE0E Pause' : '\u25B6\uFE0E Play';
         btnPlay.classList.toggle('primary', playing);
    }
    requestAnimationFrame(rafSim);
  }
  requestAnimationFrame(rafSim);
})();
