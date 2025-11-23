/* app.js — UI, Controls (nur noch Simulation) */
(function(){
  // DOM Elements
  const canvas = document.getElementById('mf-view');
  // Wichtig: Wir greifen auf den Container zu, der die ID "uiContainer" in der HTML hat
  const uiContainer = document.getElementById('uiContainer'); 
  const toggleUiBtn = document.getElementById('toggleUiBtn');

  // Controls
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

  const btnPlay = document.getElementById('btnPlay');
  const btnSnapshot = document.getElementById('btnSnapshot'); 
  const btnSvg = document.getElementById('btnSvg'); 
  const btnReset = document.getElementById('btnReset');

  // Engine Init
  if(!window.MFSim){ console.error('MFSim (engine.js) nicht geladen.'); }
  const engine = new MFSim(canvas);

  // Init Labels
  facetResValEl.textContent = 'Facets≈' + engine.updateFacetEstimate();

  // --- UI Logic: Toggle Menu ---
  function toggleUI() {
      // Klasse umschalten, die das Menü nach unten schiebt
      uiContainer.classList.toggle('ui-minimized');
      
      // Pfeilrichtung ändern
      if (uiContainer.classList.contains('ui-minimized')) {
          toggleUiBtn.textContent = '▲'; // Pfeil nach oben zum Ausklappen
      } else {
          toggleUiBtn.textContent = '▼'; // Pfeil nach unten zum Einklappen
      }
  }

  // Event Listener für den Reiter-Button
  if(toggleUiBtn) {
      toggleUiBtn.addEventListener('click', toggleUI);
  }

  // Event Listener für Slider
  facetResEl.addEventListener('input', ()=>{ engine.setParam('facetRes', parseFloat(facetResEl.value)); facetResValEl.textContent = 'Facets≈' + engine.updateFacetEstimate(); });
  roughEl.addEventListener('input', ()=>{ engine.setParam('rough', parseFloat(roughEl.value)); roughValEl.textContent=roughEl.value; });
  zoomEl.addEventListener('input', ()=>{ engine.setParam('zoom', parseFloat(zoomEl.value)); zoomValEl.textContent=zoomEl.value+'×'; });
  speedEl.addEventListener('input', ()=>{ engine.setParam('speedAir', parseFloat(speedEl.value)); speedValEl.textContent=Math.round(speedEl.value)+' px/s'; });
  
  autoStopEl.addEventListener('change', ()=>{ engine.setParam('autoStop', autoStopEl.checked); });
  stopTimeEl.addEventListener('input', ()=>{ engine.setParam('stopTime', parseFloat(stopTimeEl.value)); });

  countEl.addEventListener('input', ()=>{ engine.setParam('pCount', parseInt(countEl.value,10)); countValEl.textContent=countEl.value; facetResValEl.textContent = 'Facets≈' + engine.updateFacetEstimate(); });
  
  radiusEl.addEventListener('input', ()=>{
      engine.setParam('radius', parseFloat(radiusEl.value));
      radiusValEl.textContent = parseFloat(radiusEl.value).toFixed(1) + ' px';
  });

  sigParaEl.addEventListener('input', ()=>{ engine.setParam('sigPara', parseFloat(sigParaEl.value)); sigParaValEl.textContent=Math.round(sigParaEl.value)+' px'; });
  sigOrthoEl.addEventListener('input', ()=>{ engine.setParam('sigOrtho', parseFloat(sigOrthoEl.value)); sigOrthoValEl.textContent=Math.round(sigOrthoEl.value)+' px'; });

  nEl.addEventListener('input', ()=>{ engine.setParam('nMat', parseFloat(nEl.value)); nValEl.textContent = parseFloat(nEl.value).toFixed(2); });
  aEl.addEventListener('input', ()=>{ engine.setParam('aCoeff', parseFloat(aEl.value)); aValEl.textContent = parseFloat(aEl.value).toFixed(2); });
  sEl.addEventListener('input', ()=>{ engine.setParam('sCoeff', parseFloat(sEl.value)); sValEl.textContent = parseFloat(sEl.value).toFixed(2); });
  hgEl.addEventListener('input', ()=>{ engine.setParam('hg', parseFloat(hgEl.value)); hgValEl.textContent = parseFloat(hgEl.value).toFixed(2); });

  detWidthEl.addEventListener('input', ()=>{ engine.setParam('detWidth', parseFloat(detWidthEl.value)); detWidthValEl.textContent = Math.round(detWidthEl.value) + ' px'; });
  geoToggleEl.addEventListener('change', ()=>{ engine.setParam('showGeo', geoToggleEl.checked); geoValEl.textContent= geoToggleEl.checked?'An':'Aus'; });
  showSSSEl.addEventListener('change', ()=>{ engine.setParam('showSSS', showSSSEl.checked); showSSSValEl.textContent= showSSSEl.checked?'An':'Aus'; });
  hideReentryEl.addEventListener('change', ()=>{ engine.setParam('hideReentry', hideReentryEl.checked); });
  showRedEl.addEventListener('change', ()=>{ engine.setParam('showRed', showRedEl.checked); showRedValEl.textContent= showRedEl.checked?'An':'Aus'; });
  useFresnelEl.addEventListener('change', ()=>{ engine.setParam('useFresnel', useFresnelEl.checked); useFresnelValEl.textContent= useFresnelEl.checked?'An':'Aus'; });

  btnReset.addEventListener('click', ()=>{ engine.resetWave(false); });
  btnPlay.addEventListener('click', ()=>{ const p=!engine.isPlaying; engine.setPlaying(p); btnPlay.textContent = p? '⏸︎ Pause':'▶︎ Play'; btnPlay.classList.toggle('primary', p); });
  
  btnSnapshot.addEventListener('click', ()=>{ engine.exportHighRes(6); });

  // SVG Export logic
  btnSvg.addEventListener('click', ()=>{
      if(!window.SVGContext) return alert("SVG Exporter nicht geladen.");
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
  
  // Key Listener
  window.addEventListener('keydown', (e)=>{
    if(e.code==='Space'){ 
        e.preventDefault(); const p=!engine.isPlaying; engine.setPlaying(p); 
        btnPlay.textContent = p? '⏸︎ Pause':'▶︎ Play'; btnPlay.classList.toggle('primary', p); 
    }
    if(e.code==='KeyH'){ 
        toggleUI(); // Ruft die gleiche Funktion auf wie der Button
    }
  });

  // Color Helpers
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

  // Loop
  let lastTS=0;
  function rafSim(ts){
    if(!lastTS) lastTS=ts;
    const dt=Math.min(0.05, (ts-lastTS)/1000);
    lastTS=ts;
    engine.step(dt);
    engine.draw();
    
    // Sync Play Button text if autostop happens
    const playing = engine.getIsPlaying();
    // Prüfen ob Text und Status asynchron sind
    const btnIsPause = btnPlay.textContent.includes('Pause');
    if(btnIsPause !== playing){
         btnPlay.textContent = playing ? '⏸︎ Pause' : '▶︎ Play';
         btnPlay.classList.toggle('primary', playing);
    }
    requestAnimationFrame(rafSim);
  }
  requestAnimationFrame(rafSim);
})();
