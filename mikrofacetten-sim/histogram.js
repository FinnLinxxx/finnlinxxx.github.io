/* histogram.js — Detector Impulse Response Chart with accumulation, timeline, save/clear */
(function(){

  // Rounded rectangle path helper
  function roundRect(ctx, x, y, w, h, r){
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
  }

  // Gaussian kernel smoothing — returns Float64Array of smoothed values
  function gaussSmooth(bins, nBins, sigma){
    const out = new Float64Array(nBins);
    if(sigma < 0.5){
      for(let i=0; i<nBins; i++) out[i] = bins[i]||0;
      return out;
    }
    const radius = Math.ceil(3 * sigma);
    for(let i=0; i<nBins; i++){
      let sum=0, wSum=0;
      for(let j=Math.max(0,i-radius); j<=Math.min(nBins-1,i+radius); j++){
        const w = Math.exp(-0.5*((i-j)/sigma)**2);
        sum += (bins[j]||0)*w;
        wSum += w;
      }
      out[i] = wSum > 0 ? sum/wSum : 0;
    }
    return out;
  }

  // Catmull-Rom spline through points
  function catmullRomSpline(ctx, pts, tension){
    if(pts.length < 2) return;
    const t = (tension != null) ? tension : 0.5;
    ctx.moveTo(pts[0].x, pts[0].y);
    for(let i=0; i<pts.length-1; i++){
      const p0 = pts[Math.max(0, i-1)];
      const p1 = pts[i];
      const p2 = pts[i+1];
      const p3 = pts[Math.min(pts.length-1, i+2)];
      const subdivs = Math.round(8 + t * 24);
      for(let s=1; s<=subdivs; s++){
        const u = s/subdivs;
        const u2 = u*u, u3 = u2*u;
        const x = 0.5*((-t*u + 2*t*u2 - t*u3)*p0.x + (2 + (t-6)*u2 + (4-t)*u3)*p1.x +
                  (t*u + (6-2*t)*u2 + (t-4)*u3)*p2.x + (-t*u2 + t*u3)*p3.x);
        const y = 0.5*((-t*u + 2*t*u2 - t*u3)*p0.y + (2 + (t-6)*u2 + (4-t)*u3)*p1.y +
                  (t*u + (6-2*t)*u2 + (t-4)*u3)*p2.y + (-t*u2 + t*u3)*p3.y);
        ctx.lineTo(x, y);
      }
    }
  }

  class HistogramChart {
    constructor(canvasId, statsId){
      this.canvas = document.getElementById(canvasId);
      this.statsEl = document.getElementById(statsId);
      this.ctx = this.canvas.getContext('2d');
      this.binSize = 20;
      this.showSpline = true;
      this.splineTension = 0.5;
      this.showCombined = false;
      this.logScale = false;
      this.useInnerPath = false;
      this.chartMode = 'accumulate'; // 'accumulate' | 'timeline'
      this.normalize = false;
      this.nominalDist = null; // set externally (e.g. rhoM) for Soll/Ist display
      this.pad = { top:22, right:18, bottom:52, left:52 };
      // Color palette — each entry is a distinct pair for reflected + SSS
      this.PALETTE = [
        { bar:'#ff5d2a', barSSS:'#3c37b4', line:'#cc2200', lineSSS:'#2a1a99' },
        { bar:'#00897b', barSSS:'#e65100', line:'#00695c', lineSSS:'#bf360c' },
        { bar:'#7b1fa2', barSSS:'#43a047', line:'#6a1b9a', lineSSS:'#2e7d32' },
        { bar:'#1565c0', barSSS:'#c62828', line:'#0d47a1', lineSSS:'#b71c1c' },
        { bar:'#00838f', barSSS:'#ad1457', line:'#006064', lineSSS:'#880e4f' },
        { bar:'#827717', barSSS:'#4527a0', line:'#558b2f', lineSSS:'#311b92' },
      ];
      this.colorIdx = 0;
      this._applyPalette(0);

      // Accumulated bins (persist across waves until reset)
      this.accRed = {};
      this.accSSS = {};
      this.totalRed = 0;
      this.totalSSS = 0;
      this.waves = 0;
      this._lastRedLen = 0;
      this._lastSSSLen = 0;

      // Timeline mode: raw time-stamped hits
      this.tlRed = [];  // [{time, pathLength}]
      this.tlSSS = [];

      // Saved snapshots (survive reset, only cleared by Clear All)
      this.snapshots = [];

      this.fitDPI();
      window.addEventListener('resize', ()=>this.fitDPI());
    }

    fitDPI(){
      const dpr = Math.min(2, window.devicePixelRatio||1);
      const cssW = this.canvas.clientWidth, cssH = this.canvas.clientHeight;
      if(cssW===0 || cssH===0) return;
      this.canvas.width = Math.round(cssW*dpr);
      this.canvas.height = Math.round(cssH*dpr);
      this.ctx.setTransform(dpr,0,0,dpr,0,0);
      this.W = cssW; this.H = cssH;
    }

    setBinSize(s){
      if(s === this.binSize) return;
      this.binSize = Math.max(1, s);
      this.reset();
    }

    setUseInnerPath(v){ this.useInnerPath = v; }

    setChartMode(mode){
      this.chartMode = mode;
      this.reset();
    }

    _applyPalette(idx){
      const pal = this.PALETTE[idx % this.PALETTE.length];
      this.colorRed = pal.bar;
      this.colorSSS = pal.barSSS;
      this.colorRedSpline = pal.line;
      this.colorSSSSpline = pal.lineSSS;
    }

    reset(){
      this.accRed = {}; this.accSSS = {};
      this.totalRed = 0; this.totalSSS = 0;
      this.waves = 0;
      // Keep _lastRedLen/_lastSSSLen so existing engine hits aren't re-ingested
      this.tlRed = []; this.tlSSS = [];
    }

    clearAll(){
      this.reset();
      this.snapshots = [];
      this.colorIdx = 0;
      this._applyPalette(0);
    }

    saveSnapshot(){
      if(this.totalRed + this.totalSSS === 0) return;
      const pal = this.PALETTE[this.colorIdx % this.PALETTE.length];
      let snapRed, snapSSS;
      if(this.chartMode === 'timeline'){
        snapRed = {}; snapSSS = {};
        let maxTime = 0.1;
        for(const h of this.tlRed) if(h.time > maxTime) maxTime = h.time;
        for(const h of this.tlSSS) if(h.time > maxTime) maxTime = h.time;
        const W = this.W || 800;
        const plotW = W - this.pad.left - this.pad.right;
        const timeBinSize = maxTime / Math.max(1, Math.floor(plotW / 6));
        for(const h of this.tlRed){ const i = Math.floor(h.time / timeBinSize); snapRed[i]=(snapRed[i]||0)+1; }
        for(const h of this.tlSSS){ const i = Math.floor(h.time / timeBinSize); snapSSS[i]=(snapSSS[i]||0)+1; }
      } else {
        snapRed = Object.assign({}, this.accRed);
        snapSSS = Object.assign({}, this.accSSS);
      }
      this.snapshots.push({
        accRed: snapRed,
        accSSS: snapSSS,
        totalRed: this.totalRed,
        totalSSS: this.totalSSS,
        binSize: this.binSize,
        chartMode: this.chartMode,
        colors: { bar:pal.bar, barSSS:pal.barSSS, line:pal.line, lineSSS:pal.lineSSS },
        label: 'Run ' + (this.snapshots.length + 1)
      });
      // Advance to next color pair and soft-reset (keep ingestion cursors)
      this.colorIdx = (this.colorIdx + 1) % this.PALETTE.length;
      this._applyPalette(this.colorIdx);
      this.accRed = {}; this.accSSS = {};
      this.totalRed = 0; this.totalSSS = 0;
      this.waves = 0;
      this.tlRed = []; this.tlSSS = [];
    }

    ingest(hitsRed, hitsSSS){
      const bs = this.binSize;
      const useInner = this.useInnerPath;
      for(let i=this._lastRedLen; i<hitsRed.length; i++){
        const h = hitsRed[i];
        if(this.chartMode === 'accumulate'){
          const pl = useInner ? (h.innerPathLength||0) : (h.pathLength||0);
          const idx = Math.floor(pl / bs);
          this.accRed[idx] = (this.accRed[idx]||0) + 1;
        } else {
          this.tlRed.push({time:h.time, pl: useInner ? (h.innerPathLength||0) : (h.pathLength||0)});
        }
        this.totalRed++;
      }
      for(let i=this._lastSSSLen; i<hitsSSS.length; i++){
        const h = hitsSSS[i];
        if(this.chartMode === 'accumulate'){
          const pl = useInner ? (h.innerPathLength||0) : (h.pathLength||0);
          const idx = Math.floor(pl / bs);
          this.accSSS[idx] = (this.accSSS[idx]||0) + 1;
        } else {
          this.tlSSS.push({time:h.time, pl: useInner ? (h.innerPathLength||0) : (h.pathLength||0)});
        }
        this.totalSSS++;
      }
      this._lastRedLen = hitsRed.length;
      this._lastSSSLen = hitsSSS.length;
    }

    onWaveReset(hitsRedLen, hitsSSSLen){
      if(hitsRedLen === 0 && hitsSSSLen === 0){
        this._lastRedLen = 0; this._lastSSSLen = 0;
      } else {
        this._lastRedLen = hitsRedLen;
        this._lastSSSLen = hitsSSSLen;
      }
      this.waves++;
    }

    draw(){
      if(this.chartMode === 'timeline') this._drawTimeline();
      else this._drawAccumulate();
    }

    // ========== ACCUMULATE MODE ==========
    _drawAccumulate(){
      const ctx = this.ctx;
      const W = this.W, H = this.H;
      if(!W || !H) return;
      const p = this.pad;
      const plotW = W - p.left - p.right;
      const plotH = H - p.top - p.bottom;

      // Find global range (including snapshots)
      let maxIdx = 0;
      const allBinSets = [{r:this.accRed, s:this.accSSS}];
      for(const snap of this.snapshots){
        if(snap.chartMode === 'accumulate' && snap.binSize === this.binSize){
          allBinSets.push({r:snap.accRed, s:snap.accSSS});
        }
      }
      for(const bs of allBinSets){
        for(const k in bs.r){ if(+k > maxIdx) maxIdx = +k; }
        for(const k in bs.s){ if(+k > maxIdx) maxIdx = +k; }
      }
      const nBins = Math.max(maxIdx+1, 1);

      // Normalization helper: scale a (red, SSS) pair so their combined area = 1
      const normPair = (r, s) => {
        if(!this.normalize) return [r, s];
        let tot = 0;
        for(let i=0; i<nBins; i++) tot += (r[i]||0) + (s[i]||0);
        if(tot === 0) return [r, s];
        const f = 1 / (tot * this.binSize);
        const nr = {}, ns = {};
        for(const k in r) nr[k] = r[k] * f;
        for(const k in s) ns[k] = s[k] * f;
        return [nr, ns];
      };
      const [curR, curS] = normPair(this.accRed, this.accSSS);

      let maxCount = 0;
      { for(let i=0; i<nBins; i++){
          let v = Math.max(curR[i]||0, curS[i]||0);
          if(this.showCombined) v = Math.max(v, (curR[i]||0) + (curS[i]||0));
          if(v > maxCount) maxCount = v;
        }
      }
      for(const snap of this.snapshots){
        if(snap.chartMode !== 'accumulate' || snap.binSize !== this.binSize) continue;
        const [sr, ss] = normPair(snap.accRed, snap.accSSS);
        for(let i=0; i<nBins; i++){
          let v = Math.max(sr[i]||0, ss[i]||0);
          if(this.showCombined) v = Math.max(v, (sr[i]||0) + (ss[i]||0));
          if(v > maxCount) maxCount = v;
        }
      }
      if(maxCount <= 0) maxCount = this.normalize ? 1e-9 : 1;

      const logMax = this.logScale ? Math.log10(maxCount+1) : maxCount;
      const valToY = (v)=>{
        if(this.logScale){
          const lv = v > 0 ? Math.log10(v+1) : 0;
          return p.top + plotH - (lv / logMax) * plotH;
        }
        return p.top + plotH - (v / maxCount) * plotH;
      };

      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = '#f8f9fb';
      ctx.fillRect(p.left, p.top, plotW, plotH);

      // Grid
      this._drawGrid(ctx, p, plotW, plotH, 5);

      const barW = Math.max(1, plotW / Math.max(nBins, 1));

      // Draw saved snapshots first (behind) — full visibility with their own colors
      for(const snap of this.snapshots){
        if(snap.chartMode !== 'accumulate' || snap.binSize !== this.binSize) continue;
        const [sr, ss] = normPair(snap.accRed, snap.accSSS);
        this._drawBars(ctx, sr, ss, nBins, barW, valToY, p, plotH, 0.5, snap.colors.bar, snap.colors.barSSS);
        if(this.showSpline){
          this._drawSpline(ctx, sr, nBins, barW, valToY, snap.colors.line, 2.2);
          this._drawSpline(ctx, ss, nBins, barW, valToY, snap.colors.lineSSS, 2.2);
        }
      }

      // Draw current data
      this._drawBars(ctx, curR, curS, nBins, barW, valToY, p, plotH, 0.5);
      if(this.showSpline && nBins >= 2){
        this._drawSpline(ctx, curR, nBins, barW, valToY, this.colorRedSpline, 2.2);
        this._drawSpline(ctx, curS, nBins, barW, valToY, this.colorSSSSpline, 2.2);
      }

      // Combined curves (snapshots + current)
      if(this.showCombined){
        for(const snap of this.snapshots){
          if(snap.chartMode !== 'accumulate' || snap.binSize !== this.binSize) continue;
          const [sr, ss] = normPair(snap.accRed, snap.accSSS);
          const cb = this._combineBins(sr, ss, nBins);
          this._drawSingleBars(ctx, cb, nBins, barW, valToY, p, plotH, 0.2, '#888');
          if(this.showSpline) this._drawSpline(ctx, cb, nBins, barW, valToY, '#666', 2.5);
        }
        const cb = this._combineBins(curR, curS, nBins);
        this._drawSingleBars(ctx, cb, nBins, barW, valToY, p, plotH, 0.2, '#555');
        if(this.showSpline && nBins >= 2) this._drawSpline(ctx, cb, nBins, barW, valToY, '#333', 2.8);
      }

      // Axes + labels
      this._drawAxes(ctx, p, plotW, plotH);
      this._drawYLabels(ctx, p, plotH, 5, maxCount, logMax);
      this._drawXLabelsAccum(ctx, p, plotH, nBins, barW);
      this._drawAxisTitles(ctx, p, plotW, plotH, W, H);
      this._drawLegend(ctx, p, plotW);
      this._drawPeakMarker(ctx, p, nBins, barW, valToY);
      this._updateStats();
    }

    // ========== TIMELINE MODE ==========
    _drawTimeline(){
      const ctx = this.ctx;
      const W = this.W, H = this.H;
      if(!W || !H) return;
      const p = this.pad;
      const plotW = W - p.left - p.right;
      const plotH = H - p.top - p.bottom;

      // Build time bins
      let maxTime = 0.1;
      for(const h of this.tlRed) if(h.time > maxTime) maxTime = h.time;
      for(const h of this.tlSSS) if(h.time > maxTime) maxTime = h.time;

      // Also consider snapshots
      for(const snap of this.snapshots){
        if(snap.chartMode === 'timeline'){
          for(const k in snap.accRed) if(+k * snap.binSize > maxTime) maxTime = +k * snap.binSize;
          for(const k in snap.accSSS) if(+k * snap.binSize > maxTime) maxTime = +k * snap.binSize;
        }
      }

      const timeBinSize = maxTime / Math.max(1, Math.floor(plotW / 6));
      const tlRedBins = {}, tlSSSBins = {};
      let tlMaxIdx = 0;
      for(const h of this.tlRed){ const idx = Math.floor(h.time / timeBinSize); tlRedBins[idx]=(tlRedBins[idx]||0)+1; if(idx>tlMaxIdx)tlMaxIdx=idx; }
      for(const h of this.tlSSS){ const idx = Math.floor(h.time / timeBinSize); tlSSSBins[idx]=(tlSSSBins[idx]||0)+1; if(idx>tlMaxIdx)tlMaxIdx=idx; }
      const nBins = Math.max(tlMaxIdx+1, 1);

      let maxCount = 1;
      for(let i=0;i<nBins;i++){
        let v = Math.max(tlRedBins[i]||0, tlSSSBins[i]||0);
        if(this.showCombined) v = Math.max(v, (tlRedBins[i]||0) + (tlSSSBins[i]||0));
        if(v > maxCount) maxCount = v;
      }

      // Also check snapshot maxes
      for(const snap of this.snapshots){
        if(snap.chartMode === 'timeline'){
          for(const k in snap.accRed){
            let v = Math.max(snap.accRed[k]||0, snap.accSSS[k]||0);
            if(this.showCombined) v = Math.max(v, (snap.accRed[k]||0) + (snap.accSSS[k]||0));
            maxCount = Math.max(maxCount, v);
          }
          for(const k in snap.accSSS) maxCount = Math.max(maxCount, snap.accSSS[k]||0);
        }
      }

      const logMax = this.logScale ? Math.log10(maxCount+1) : maxCount;
      const valToY = (v)=>{
        if(this.logScale){
          const lv = v > 0 ? Math.log10(v+1) : 0;
          return p.top + plotH - (lv / logMax) * plotH;
        }
        return p.top + plotH - (v / maxCount) * plotH;
      };

      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = '#f8f9fb';
      ctx.fillRect(p.left, p.top, plotW, plotH);
      this._drawGrid(ctx, p, plotW, plotH, 5);

      const barW = Math.max(1, plotW / Math.max(nBins, 1));

      // Snapshots — full visibility with their own colors
      for(const snap of this.snapshots){
        if(snap.chartMode !== 'timeline') continue;
        this._drawBars(ctx, snap.accRed, snap.accSSS, nBins, barW, valToY, p, plotH, 0.5, snap.colors.bar, snap.colors.barSSS);
        if(this.showSpline){
          this._drawSpline(ctx, snap.accRed, nBins, barW, valToY, snap.colors.line, 2.2);
          this._drawSpline(ctx, snap.accSSS, nBins, barW, valToY, snap.colors.lineSSS, 2.2);
        }
      }

      // Current
      this._drawBars(ctx, tlRedBins, tlSSSBins, nBins, barW, valToY, p, plotH, 0.5);
      if(this.showSpline && nBins >= 2){
        this._drawSpline(ctx, tlRedBins, nBins, barW, valToY, this.colorRedSpline, 2.2);
        this._drawSpline(ctx, tlSSSBins, nBins, barW, valToY, this.colorSSSSpline, 2.2);
      }

      // Combined curves
      if(this.showCombined){
        for(const snap of this.snapshots){
          if(snap.chartMode !== 'timeline') continue;
          const cb = this._combineBins(snap.accRed, snap.accSSS, nBins);
          this._drawSingleBars(ctx, cb, nBins, barW, valToY, p, plotH, 0.2, '#888');
          if(this.showSpline) this._drawSpline(ctx, cb, nBins, barW, valToY, '#666', 2.5);
        }
        const cb = this._combineBins(tlRedBins, tlSSSBins, nBins);
        this._drawSingleBars(ctx, cb, nBins, barW, valToY, p, plotH, 0.2, '#555');
        if(this.showSpline && nBins >= 2) this._drawSpline(ctx, cb, nBins, barW, valToY, '#333', 2.8);
      }

      this._drawAxes(ctx, p, plotW, plotH);
      this._drawYLabels(ctx, p, plotH, 5, maxCount, logMax);

      // X labels: time
      ctx.fillStyle = '#555'; ctx.font = '10px system-ui,sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      const xStep = Math.max(1, Math.floor(nBins / 10));
      for(let i=0; i<nBins; i+=xStep){
        const x = p.left + (i + 0.5) * barW;
        const t = (i * timeBinSize).toFixed(2);
        ctx.fillText(t+'s', x, p.top + plotH + 5);
      }

      // Axis titles
      ctx.fillStyle = '#888'; ctx.font = '10px system-ui,sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Time (s)', p.left + plotW/2, H - 3);
      ctx.save();
      ctx.translate(11, p.top + plotH/2); ctx.rotate(-Math.PI/2);
      ctx.fillText(this.logScale ? 'Hits (log)' : 'Hits', 0, 0);
      ctx.restore();

      this._drawLegend(ctx, p, plotW);
      this._updateStats();
    }

    // ========== SHARED DRAW HELPERS ==========
    _drawGrid(ctx, p, plotW, plotH, n){
      ctx.strokeStyle = 'rgba(0,0,0,0.05)'; ctx.lineWidth = 1;
      for(let i=1; i<=n; i++){
        const y = p.top + plotH - (i/n)*plotH;
        ctx.beginPath(); ctx.moveTo(p.left, y); ctx.lineTo(p.left+plotW, y); ctx.stroke();
      }
    }

    _drawBars(ctx, binsRed, binsSSS, nBins, barW, valToY, p, plotH, alpha, cRed, cSSS){
      const colorR = cRed || this.colorRed;
      const colorS = cSSS || this.colorSSS;
      const pad = Math.max(0.5, barW * 0.04);
      const bw = barW - pad;
      const base = p.top + plotH;
      for(let i=0; i<nBins; i++){
        const x = p.left + i * barW + pad/2;
        const sVal = binsSSS[i]||0;
        const rVal = binsRed[i]||0;
        if(sVal > 0){
          const yTop = valToY(sVal);
          ctx.fillStyle = colorS; ctx.globalAlpha = alpha;
          ctx.fillRect(x, yTop, bw, base - yTop);
          ctx.globalAlpha = 1;
        }
        if(rVal > 0){
          const yTop = valToY(rVal);
          ctx.fillStyle = colorR; ctx.globalAlpha = alpha;
          ctx.fillRect(x, yTop, bw, base - yTop);
          ctx.globalAlpha = 1;
        }
      }
    }

    _combineBins(binsR, binsS, nBins){
      const c = {};
      for(let i=0; i<nBins; i++){
        const sum = (binsR[i]||0) + (binsS[i]||0);
        if(sum > 0) c[i] = sum;
      }
      return c;
    }

    _drawSingleBars(ctx, bins, nBins, barW, valToY, p, plotH, alpha, color){
      const pad = Math.max(0.5, barW * 0.04);
      const bw = barW - pad;
      const base = p.top + plotH;
      for(let i=0; i<nBins; i++){
        const v = bins[i]||0;
        if(v > 0){
          ctx.fillStyle = color; ctx.globalAlpha = alpha;
          ctx.fillRect(p.left + i*barW + pad/2, valToY(v), bw, base - valToY(v));
          ctx.globalAlpha = 1;
        }
      }
    }

    _drawSpline(ctx, bins, nBins, barW, valToY, color, lineW){
      const p = this.pad;

      // Find the populated range
      let first = -1, last = -1;
      for(let i=0; i<nBins; i++) if((bins[i]||0) > 0){ if(first<0) first=i; last=i; }
      if(first < 0) return;

      // Gaussian smoothing — sigma scales with data range and slider value
      const sigma = this.splineTension * (last - first + 1) * 0.3;
      const smoothed = gaussSmooth(bins, nBins, sigma);

      // Build points over the populated range (extended by the kernel radius)
      const extend = Math.max(1, Math.ceil(sigma));
      const from = Math.max(0, first - extend);
      const to   = Math.min(nBins - 1, last + extend);
      const pts = [];
      for(let i=from; i<=to; i++){
        pts.push({ x: p.left + (i + 0.5) * barW, y: valToY(smoothed[i]) });
      }
      if(pts.length < 2) return;

      ctx.save();
      ctx.beginPath();
      ctx.rect(p.left, p.top, this.W - p.left - p.right, this.H - p.top - p.bottom);
      ctx.clip();
      ctx.beginPath();
      ctx.strokeStyle = color; ctx.lineWidth = lineW;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      catmullRomSpline(ctx, pts, 0.5); // fixed Catmull-Rom tension for clean interpolation
      ctx.stroke();
      ctx.restore();
    }

    _drawAxes(ctx, p, plotW, plotH){
      ctx.strokeStyle = '#444'; ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(p.left, p.top); ctx.lineTo(p.left, p.top + plotH); ctx.lineTo(p.left + plotW, p.top + plotH);
      ctx.stroke();
    }

    _drawYLabels(ctx, p, plotH, n, maxCount, logMax){
      ctx.fillStyle = '#555'; ctx.font = '10px system-ui,sans-serif';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for(let i=0; i<=n; i++){
        const frac = i/n;
        let val;
        if(this.logScale){
          val = Math.round(Math.pow(10, frac * logMax) - 1);
        } else if(this.normalize){
          const v = frac * maxCount;
          val = v === 0 ? '0' : (v < 0.001 ? v.toExponential(1) : v.toPrecision(2));
        } else {
          val = Math.round(frac * maxCount);
        }
        const y = p.top + plotH - frac * plotH;
        ctx.fillText(val, p.left - 5, y);
      }
    }

    _drawXLabelsAccum(ctx, p, plotH, nBins, barW){
      ctx.fillStyle = '#555'; ctx.font = '10px system-ui,sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      const step = Math.max(1, Math.floor(nBins / 10));
      for(let i=0; i<nBins; i+=step){
        const x = p.left + (i + 0.5) * barW;
        ctx.fillText(Math.round(i * this.binSize), x, p.top + plotH + 5);
      }
    }

    _drawAxisTitles(ctx, p, plotW, plotH, W, H){
      ctx.fillStyle = '#888'; ctx.font = '10px system-ui,sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(this.useInnerPath ? 'Inner Path Length (px)' : 'Path Length (px)', p.left + plotW/2, H - 14);
      ctx.save();
      ctx.translate(11, p.top + plotH/2); ctx.rotate(-Math.PI/2);
      ctx.fillText(this.normalize ? 'Density' : (this.logScale ? 'Count (log)' : 'Count'), 0, 0);
      ctx.restore();
    }

    _drawLegendEntry(ctx, lx, ly, legendW, colorR, colorS, label, countR, countS, bold){
      const cy = ly + 10;
      ctx.beginPath(); ctx.arc(lx+14, cy, 4.5, 0, Math.PI*2);
      ctx.fillStyle = colorR; ctx.fill();
      ctx.beginPath(); ctx.arc(lx+28, cy, 4.5, 0, Math.PI*2);
      ctx.fillStyle = colorS; ctx.fill();
      ctx.textBaseline = 'middle';
      ctx.fillStyle = bold ? '#222' : '#555';
      ctx.font = (bold ? 'bold ' : '') + '11px system-ui,sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(label, lx+40, cy);
      ctx.fillStyle = '#888'; ctx.font = '10px system-ui,sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(countR+' / '+countS, lx+legendW-12, cy);
    }

    _drawLegend(ctx, p, plotW){
      if(this.snapshots.length === 0 && this.totalRed + this.totalSSS === 0) return;

      const rowH = 22;
      const hasCombined = this.showCombined;
      const nEntries = 1 + this.snapshots.length + (hasCombined ? 1 : 0);
      const hasSep = this.snapshots.length > 0;
      const legendW = 210;
      const legendH = nEntries * rowH + (hasSep ? 8 : 0) + 14;
      const lx = p.left + plotW - legendW - 8;
      let ly = p.top + 10;

      // Background
      ctx.save();
      roundRect(ctx, lx, ly, legendW, legendH, 6);
      ctx.fillStyle = 'rgba(255,255,255,0.96)';
      ctx.shadowColor = 'rgba(0,0,0,0.08)';
      ctx.shadowBlur = 10; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 2;
      ctx.fill();
      ctx.restore();
      roundRect(ctx, lx, ly, legendW, legendH, 6);
      ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1;
      ctx.stroke();

      ly += 6;

      // Snapshot entries
      for(const snap of this.snapshots){
        this._drawLegendEntry(ctx, lx, ly, legendW, snap.colors.bar, snap.colors.barSSS, snap.label, snap.totalRed, snap.totalSSS, false);
        ly += rowH;
      }

      // Separator line before live entry
      if(hasSep){
        ctx.strokeStyle = 'rgba(0,0,0,0.07)'; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(lx+10, ly+2); ctx.lineTo(lx+legendW-10, ly+2); ctx.stroke();
        ly += 8;
      }

      // Live entry
      this._drawLegendEntry(ctx, lx, ly, legendW, this.colorRed, this.colorSSS, 'Live', this.totalRed, this.totalSSS, true);
      ly += rowH;

      // Combined entry
      if(hasCombined){
        const cy = ly + 10;
        ctx.beginPath(); ctx.arc(lx+14, cy, 4.5, 0, Math.PI*2);
        ctx.fillStyle = '#555'; ctx.fill();
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#444'; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('Combined', lx+28, cy);
        ctx.fillStyle = '#888'; ctx.font = '10px system-ui,sans-serif'; ctx.textAlign = 'right';
        ctx.fillText((this.totalRed+this.totalSSS)+'', lx+legendW-12, cy);
      }
    }

    _drawPeakMarker(ctx, p, nBins, barW, valToY){
      if(this.totalRed + this.totalSSS === 0) return;
      let peakIdx = 0, peakVal = 0;
      for(let i=0; i<nBins; i++){
        const v = (this.accRed[i]||0) + (this.accSSS[i]||0);
        if(v > peakVal){ peakVal = v; peakIdx = i; }
      }
      const peakX = p.left + (peakIdx + 0.5) * barW;
      const peakY = valToY(peakVal) - 8;
      ctx.fillStyle = '#e74c3c'; ctx.font = 'bold 9px system-ui,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('\u25BC', peakX, peakY);
    }

    _computeCentroid(){
      let sumW = 0, sumX = 0;
      for(const k in this.accRed){ const c = this.accRed[k]||0; sumW += c; sumX += c * ((+k + 0.5) * this.binSize); }
      for(const k in this.accSSS){ const c = this.accSSS[k]||0; sumW += c; sumX += c * ((+k + 0.5) * this.binSize); }
      return sumW > 0 ? sumX / sumW : null;
    }

    _updateStats(){
      if(!this.statsEl) return;
      const centroid = this._computeCentroid();
      let centStr = '';
      if(centroid !== null){
        if(this.nominalDist != null){
          const delta = Math.round(centroid - this.nominalDist);
          const sign = delta >= 0 ? '+' : '';
          centStr = ` &middot; <b>Ist:</b> ${Math.round(centroid)}\u202fpx &nbsp;<b>Soll:</b> ${Math.round(this.nominalDist)}\u202fpx &nbsp;<b>\u0394:</b> ${sign}${delta}\u202fpx`;
        } else {
          centStr = ` &middot; <b>Centroid:</b> ${Math.round(centroid)}\u202fpx`;
        }
      }
      const snapInfo = this.snapshots.length > 0 ? ` &middot; <b>Saved:</b> ${this.snapshots.length}` : '';
      this.statsEl.innerHTML =
        `<b>Refl:</b> ${this.totalRed} <b>SSS:</b> ${this.totalSSS} <b>Tot:</b> ${this.totalRed+this.totalSSS}` +
        centStr +
        `<br><b>Waves:</b> ${this.waves}` + snapInfo;
    }
  }

  window.HistogramChart = HistogramChart;
})();
