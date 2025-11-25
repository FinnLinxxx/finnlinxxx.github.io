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
  const showSSSValEl = document.getElementById('mf-showSSSVal');
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

  if(!window.MFSim){ console.error('MFSim (engine.js) nicht geladen.'); }
  const engine = new MFSim(canvas);

  facetResValEl.textContent = 'Facets≈' + engine.updateFacetEstimate();

  function getLogValue(sliderVal) {
      const minLog = 0.01; const maxLog = 10.0;
      const position = parseFloat(sliderVal) / 100.0;
      return minLog * Math.pow(maxLog / minLog, position);
  }

  // UI Toggle Logic: angepasst für Sidebar
  function toggleUI() {
      uiContainer.classList.toggle('ui-minimized');
      if (uiContainer.classList.contains('ui-minimized')) {
          toggleUiBtn.textContent = '◀'; // Nach Links zeigen zum Hervorholen
      } else {
          toggleUiBtn.textContent = '▶'; // Nach Rechts zeigen zum Wegschieben
      }
  }
  if(toggleUiBtn) toggleUiBtn.addEventListener('click', toggleUI);

  // Listeners
  facetResEl.addEventListener('input', ()=>{ engine.setParam('facetRes', parseFloat(facetResEl.value)); facetResValEl.textContent = 'Facets≈' + engine.updateFacetEstimate(); });
  roughEl.addEventListener('input', ()=>{ engine.setParam('rough', parseFloat(roughEl.value)); roughValEl.textContent=roughEl.value; });
  zoomEl.addEventListener('input', ()=>{ engine.setParam('zoom', parseFloat(zoomEl.value)); zoomValEl.textContent=zoomEl.value+'×'; });
  speedEl.addEventListener('input', ()=>{ engine.setParam('speedAir', parseFloat(speedEl.value)); speedValEl.textContent=Math.round(speedEl.value)+' px/s'; });
  autoStopEl.addEventListener('change', ()=>{ engine.setParam('autoStop', autoStopEl.checked); });
  stopTimeEl.addEventListener('input', ()=>{ engine.setParam('stopTime', parseFloat(stopTimeEl.value)); });
  countEl.addEventListener('input', ()=>{ engine.setParam('pCount', parseInt(countEl.value,10)); countValEl.textContent=countEl.value; facetResValEl.textContent = 'Facets≈' + engine.updateFacetEstimate(); });
  radiusEl.addEventListener('input', ()=>{ engine.setParam('radius', parseFloat(radiusEl.value)); radiusValEl.textContent = parseFloat(radiusEl.value).toFixed(1) + ' px'; });
  sigParaEl.addEventListener('input', ()=>{ engine.setParam('sigPara', parseFloat(sigParaEl.value)); sigParaValEl.textContent=Math.round(sigParaEl.value)+' px'; });
  sigOrthoEl.addEventListener('input', ()=>{ engine.setParam('sigOrtho', parseFloat(sigOrthoEl.value)); sigOrthoValEl.textContent=Math.round(sigOrthoEl.value)+' px'; });
  nEl.addEventListener('input', ()=>{ engine.setParam('nMat', parseFloat(nEl.value)); nValEl.textContent = parseFloat(nEl.value).toFixed(2); });

  aEl.addEventListener('input', ()=>{ const val = getLogValue(aEl.value); engine.setParam('aCoeff', val); aValEl.textContent = val.toFixed(2); });
  sEl.addEventListener('input', ()=>{ const val = getLogValue(sEl.value); engine.setParam('sCoeff', val); sValEl.textContent = val.toFixed(2); });

  hgEl.addEventListener('input', ()=>{ engine.setParam('hg', parseFloat(hgEl.value)); hgValEl.textContent = parseFloat(hgEl.value).toFixed(2); });
  detWidthEl.addEventListener('input', ()=>{ engine.setParam('detWidth', parseFloat(detWidthEl.value)); detWidthValEl.textContent = Math.round(detWidthEl.value) + ' px'; });
  geoToggleEl.addEventListener('change', ()=>{ engine.setParam('showGeo', geoToggleEl.checked); geoValEl.textContent= geoToggleEl.checked?'On':'Off'; });
  
  showDetEl.addEventListener('change', ()=>{ engine.setParam('showDet', showDetEl.checked); showDetValEl.textContent= showDetEl.checked?'On':'Off'; });

  showSSSEl.addEventListener('change', ()=>{ engine.setParam('showSSS', showSSSEl.checked); showSSSValEl.textContent= showSSSEl.checked?'An':'Aus'; });
  hideReentryEl.addEventListener('change', ()=>{ engine.setParam('hideReentry', hideReentryEl.checked); });
  showRedEl.addEventListener('change', ()=>{ engine.setParam('showRed', showRedEl.checked); showRedValEl.textContent= showRedEl.checked?'On':'Off'; });
  useFresnelEl.addEventListener('change', ()=>{ engine.setParam('useFresnel', useFresnelEl.checked); useFresnelValEl.textContent= useFresnelEl.checked?'On':'Off'; });

  btnReset.addEventListener('click', ()=>{ engine.resetWave(false); });
  btnPlay.addEventListener('click', ()=>{ const p=!engine.isPlaying; engine.setPlaying(p); btnPlay.textContent = p? '⏸︎ Pause':'▶︎ Play'; btnPlay.classList.toggle('primary', p); });
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
      link.href = url;
      link.download = "simulation-vector.svg";
      link.click();
  });
  
  window.addEventListener('keydown', (e)=>{
    if(e.code==='Space'){ e.preventDefault(); const p=!engine.isPlaying; engine.setPlaying(p); btnPlay.textContent = p? '⏸︎ Pause':'▶︎ Play'; btnPlay.classList.toggle('primary', p); }
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

  let lastTS=0;
  function rafSim(ts){
    if(!lastTS) lastTS=ts;
    const dt=Math.min(0.05, (ts-lastTS)/1000);
    lastTS=ts;
    engine.step(dt);
    engine.draw();
    const playing = engine.getIsPlaying();
    const btnIsPause = btnPlay.textContent.includes('Pause');
    if(btnIsPause !== playing){
         btnPlay.textContent = playing ? '⏸︎ Pause' : '▶︎ Play';
         btnPlay.classList.toggle('primary', playing);
    }
    requestAnimationFrame(rafSim);
  }
  requestAnimationFrame(rafSim);
})();
