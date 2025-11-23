/* engine.js — MFSim: Physik + Rendering der linken Seite */
(function(){
  // === SVG Exporter Integration ===
  class SVGContext {
    constructor(width, height) {
      this.width = width; this.height = height; this.buffer = [];
      this.currentPath = ""; this.fillStyle = "#000000"; this.strokeStyle = "#000000";
      this.lineWidth = 1; this.globalAlpha = 1; this.lineCap = "butt"; this.lineJoin = "miter";
      this.groups = [];
      this.buffer.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
      this.buffer.push(`<rect width="100%" height="100%" fill="#ffffff"/>`);
    }
    _parseColor(c){ 
      let col=c, op=1; 
      if(typeof c==='string'&&c.trim().startsWith('rgba')){ 
        const p=c.match(/[\d.]+/g); if(p&&p.length>=4){ col=`rgb(${p[0]},${p[1]},${p[2]})`; op=p[3]; } 
      } 
      return {color:col, opacity:op}; 
    }
    save(){ this.groups.push({type:'save', alpha:this.globalAlpha}); this.buffer.push(`<g>`); }
    restore(){ 
      if(this.groups.length===0)return; 
      while(true){ 
        if(this.groups.length===0)break; 
        const g=this.groups.pop(); this.buffer.push(`</g>`); 
        if(g.type==='save'){ this.globalAlpha=g.alpha; break; } 
      } 
    }
    translate(x,y){ this.buffer.push(`<g transform="translate(${x},${y})">`); this.groups.push({type:'implicit'}); }
    scale(x,y){ this.buffer.push(`<g transform="scale(${x},${y})">`); this.groups.push({type:'implicit'}); }
    rotate(a){ const d=a*180/Math.PI; this.buffer.push(`<g transform="rotate(${d})">`); this.groups.push({type:'implicit'}); }
    beginPath(){ this.currentPath=""; }
    moveTo(x,y){ this.currentPath+=`M ${x} ${y} `; }
    lineTo(x,y){ this.currentPath+=`L ${x} ${y} `; }
    closePath(){ this.currentPath+="Z "; }
    rect(x,y,w,h){ this.currentPath+=`M ${x} ${y} L ${x+w} ${y} L ${x+w} ${y+h} L ${x} ${y+h} Z `; }
    arc(x,y,r,sa,ea,ccw){
      const sx=x+r*Math.cos(sa), sy=y+r*Math.sin(sa);
      const ex=x+r*Math.cos(ea), ey=y+r*Math.sin(ea);
      if(Math.abs(ea-sa)>=Math.PI*2){ this.currentPath+=`M ${x-r} ${y} A ${r} ${r} 0 1 0 ${x+r} ${y} A ${r} ${r} 0 1 0 ${x-r} ${y} `; return; }
      const la=Math.abs(ea-sa)>Math.PI?1:0; const sw=ccw?0:1;
      if(this.currentPath.length===0) this.currentPath+=`M ${sx} ${sy} `; else this.currentPath+=`L ${sx} ${sy} `;
      this.currentPath+=`A ${r} ${r} 0 ${la} ${sw} ${ex} ${ey} `;
    }
    arcTo(x1,y1,x2,y2,r){ this.lineTo(x1,y1); }
    fill(){ 
      if(!this.currentPath)return; 
      const {color, opacity} = this._parseColor(this.fillStyle);
      this.buffer.push(`<path d="${this.currentPath}" fill="${color}" stroke="none" fill-opacity="${opacity}" />`); 
    }
    stroke(){ 
      if(!this.currentPath)return; 
      const {color, opacity} = this._parseColor(this.strokeStyle);
      this.buffer.push(`<path d="${this.currentPath}" fill="none" stroke="${color}" stroke-width="${this.lineWidth}" stroke-opacity="${opacity}" stroke-linecap="${this.lineCap}" stroke-linejoin="${this.lineJoin}" />`); 
    }
    fillRect(x,y,w,h){ 
      const {color, opacity} = this._parseColor(this.fillStyle);
      this.buffer.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" fill-opacity="${opacity}" />`); 
    }
    clearRect(x,y,w,h){} clip(){} setLineDash(){}
    getSerializedSvg(){
      while(this.groups.length>0){ this.buffer.push(`</g>`); this.groups.pop(); }
      this.buffer.push(`</svg>`); return this.buffer.join('\n');
    }
  }
  window.SVGContext = SVGContext;

  // === Main Engine ===
  const getCss = (name)=> getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const dot = (a,b)=> a.x*b.x + a.y*b.y;
  const norm = (v)=>{ const L=Math.hypot(v.x,v.y)||1; return {x:v.x/L, y:v.y/L}; };

  function reflect(d,n){ d=norm(d); n=norm(n); const k=2*dot(d,n); return norm({x:d.x-k*n.x, y:d.y-k*n.y}); }
  function refract(d,n,n1,n2){
    d=norm(d); n=norm(n); let c1 = -dot(n,d);
    if(c1<0){ n={x:-n.x,y:-n.y}; c1 = -dot(n,d); }
    const eta = n1/n2; const k = 1 - eta*eta*(1 - c1*c1);
    if(k<0) return null;
    const t = { x: eta*d.x + (eta*c1 - Math.sqrt(k))*n.x, y: eta*d.y + (eta*c1 - Math.sqrt(k))*n.y };
    return norm(t);
  }
  function mulberry32(a){ return function(){ let t=a+=0x6D2B79F5; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; } }
  function gaussian(rng){ let u=1-rng(); let v=rng(); return Math.sqrt(-2*Math.log(u))*Math.cos(Math.PI*2*v); }

  function fresnelRs_sPolar(n, k, cosThetaI){
    const sin2 = Math.max(0, 1 - cosThetaI*cosThetaI);
    const n2 = n*n - k*k; const nk2 = 2*n*k;
    const a = n2 - sin2; const b = nk2;
    const mag = Math.hypot(a, b);
    const t = Math.sqrt((mag + a)/2);
    const u = (b>=0 ? 1 : -1) * Math.sqrt((mag - a)/2);
    const A = cosThetaI - t, B = -u;
    const C = cosThetaI + t, D =  u;
    const denom = C*C + D*D;
    const Re = (A*C + B*D)/denom; const Im = (B*C - A*D)/denom;
    return Math.max(0, Math.min(1, Re*Re + Im*Im));
  }

  class MFSim {
    constructor(canvas){
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      this.colors = {
        air:  'rgba(135,206,235,1)',
        mat:  'rgba(238,227,244,1)',
        line: getCss('--mf-line'),
        red:  getCss('--photon-reflect') || '#ff5d2a',
        sss:  'rgba(60,55,180,0.75)',
        emitter: getCss('--mf-emitter') || '#00bcd4',
        det: getCss('--detector') || '#f0b93a',
        ovlPlane: getCss('--ovl-plane') || '#6b5cff',
        ovlIn: getCss('--ovl-in') || '#000000',
        ovlArc: getCss('--ovl-arc') || '#202939',
        ovlFit: 'rgba(235,30,0,0.7)'
      };

      this.params = {
        rough: 0.37, facetRes: 0.76, zoom: 1, speedAir: 500, pCount: 5001,
        radius: 5.5, autoStop: true, stopTime: 1.8,
        sigPara: 0, sigOrtho: 14, detWidth: 200,
        showGeo: true, showSSS: true, showRed: true, 
        hideReentry: false, 
        useFresnel: true, nMat: 1.40, 
        aCoeff: 0.32, sCoeff: 1.00, hg: 0
      };

      this.N_AIR = 1.0; this.MF_FLASH_T = 0.18; this.ABSORB_FLASH_T = 0.28;
      this.ABSORB_MEAN_SCATTERS = 8; this.MFP_PIXELS = 30;

      this.isPlaying = true; this.time = 0;
      this.seedGeom=12345; this.seedEmit=67890;
      this.photons=[]; this.mfFlash=[]; this.absorptions=[];
      this.cachedPoly=null;
      this.hitsRed=[]; this.hitsSSS=[];
      this.lastFresnelR = null; this.lastThetaDeg = null;

      const startX = this.canvas.clientWidth ? this.canvas.clientWidth * 0.25 : 200;
      this.emitter = {x:startX, y:null, r:8, dragging:false};

      this.fitDPI();
      window.addEventListener('resize', ()=>this.fitDPI());
      if(this.emitter.y==null) this.emitter.y=this.canvas.clientHeight/2;

      this.canvas.addEventListener('mousedown', (e)=>{
        const w=this._toWorld(e); const dx=w.x-this.emitter.x, dy=w.y-this.emitter.y;
        if(dx*dx+dy*dy<=this.emitter.r*this.emitter.r*2) this.emitter.dragging=true;
      });
      window.addEventListener('mousemove',(e)=>{
        if(!this.emitter.dragging) return;
        const w=this._toWorld(e);
        const W=this.canvas.clientWidth,H=this.canvas.clientHeight;
        this.emitter.x=Math.max(6,Math.min(W-6,w.x));
        this.emitter.y=Math.max(6,Math.min(H-6,w.y));
        this.resetWave(true);
      });
      window.addEventListener('mouseup',()=>{ this.emitter.dragging=false; });

      // --- TOUCH EVENTS FIX ---
      this.canvas.addEventListener('touchstart', (e)=>{
        const w=this._toWorld(e); 
        const dx=w.x-this.emitter.x, dy=w.y-this.emitter.y;
        // Radius-Faktor von 4 auf 25 erhöht (große Trefferzone für Finger)
        if(dx*dx+dy*dy <= this.emitter.r*this.emitter.r*25){ 
             this.emitter.dragging=true; e.preventDefault();
        }
      }, {passive:false});

      window.addEventListener('touchmove', (e)=>{
        if(!this.emitter.dragging) return;
        e.preventDefault(); 
        const w=this._toWorld(e);
        const W=this.canvas.clientWidth,H=this.canvas.clientHeight;
        this.emitter.x=Math.max(6,Math.min(W-6,w.x));
        this.emitter.y=Math.max(6,Math.min(H-6,w.y));
        this.resetWave(true);
      }, {passive:false});

      window.addEventListener('touchend', ()=>{ this.emitter.dragging=false; });

      this.resetWave(false);
    }

    setParam(name, value){
      this.params[name]=value;
      if(name==='rough' || name==='facetRes' || name==='sigPara' || name==='sigOrtho' || name==='pCount'){
        this.resetWave(true);
      }
    }
    setColor(key, rgba){ if(this.colors[key] !== undefined) this.colors[key] = rgba; }
    getIsPlaying(){ return this.isPlaying; }
    setPlaying(p){ this.isPlaying=p; }

    fitDPI(customScale){
      const baseDpr = Math.min(2, window.devicePixelRatio||1);
      const dpr = customScale ? customScale : baseDpr;
      const cssW=this.canvas.clientWidth, cssH=this.canvas.clientHeight;
      this.canvas.width=Math.round(cssW*dpr); this.canvas.height=Math.round(cssH*dpr);
      this.ctx.setTransform(dpr,0,0,dpr,0,0);
    }

    exportHighRes(scale=4){
        this.fitDPI(scale); this.draw(); 
        const link = document.createElement('a');
        link.download = 'simulation-hd.png'; link.href = this.canvas.toDataURL('image/png');
        link.click();
        this.fitDPI(); this.draw();
    }

    computeN(height, roughVal, facetRes){
      if (roughVal <= 0) return 2;
      const dyMax=80, dyMin=1.0;
      const dy = dyMax * Math.pow(dyMin/dyMax, facetRes);
      const N = Math.round(height / dy) * 5; 
      return Math.max(4, Math.min(25000, N));
    }
    updateFacetEstimate(){
      const H=this.canvas.clientHeight;
      return this.computeN(H, this.params.rough, this.params.facetRes);
    }
    buildInterface(width,height,roughVal){
      const midX=width/2;
      if(roughVal<=0) return [[midX,0],[midX,height]];
      const N=this.computeN(height,roughVal,this.params.facetRes);
      const dy=height/N;
      const rng=mulberry32(this.seedGeom);
      const rPow=Math.pow(roughVal,1.25);
      const sigmaSlope=rPow*1.1;
      const mClip=3.0*sigmaSlope;
      const A=rPow*(width*0.22);
      const xpre=new Array(N+1); xpre[0]=midX;
      for(let i=0;i<N;i++){
        let m=gaussian(rng)*sigmaSlope; if(m>mClip)m=mClip; if(m<-mClip)m=-mClip;
        xpre[i+1]=xpre[i]+dy*m;
      }
      const drift=xpre[N]-midX;
      const pts=new Array(N+1);
      for(let i=0;i<=N;i++){
        let xi=xpre[i]-(i/N)*drift; xi=Math.max(midX-A,Math.min(midX+A,xi));
        pts[i]=[xi,i*dy];
      }
      pts[0][0]=midX; pts[N][0]=midX;
      return pts;
    }
    xAtY(poly,y){
      if(y<=poly[0][1]) return poly[0][0];
      if(y>=poly[poly.length-1][1]) return poly[poly.length-1][0];
      let i=0; while(i<poly.length-1 && !(poly[i][1]<=y && y<=poly[i+1][1])) i++;
      const A=poly[i],B=poly[i+1]; const t=(y-A[1])/(B[1]-A[1]+1e-9);
      return A[0] + t*(B[0]-A[0]);
    }
    facetNormal(poly,i,side){
      const A=poly[i],B=poly[i+1];
      let nx=-(B[1]-A[1]), ny=(B[0]-A[0]);
      const L=Math.hypot(nx,ny)||1; nx/=L; ny/=L;
      if(side==='air'){ if(nx>0){ nx=-nx; ny=-ny; } }
      else { if(nx<0){ nx=-nx; ny=-ny; } }
      return {x:nx,y:ny};
    }
    buildBaseDir(poly){
      const H=this.canvas.clientHeight; const midY=H/2; const xMid=this.xAtY(poly,midY);
      const Ey=(typeof this.emitter.y==='number')?this.emitter.y:H/2;
      return norm({x:xMid-this.emitter.x,y:midY-Ey});
    }
    currentDetector(poly){
      const Ey=(typeof this.emitter.y==='number')?this.emitter.y:this.canvas.clientHeight/2;
      const E={x:this.emitter.x,y:Ey};
      const baseDir=this.buildBaseDir(poly);
      const ortho={x:-baseDir.y, y: baseDir.x};
      const half = this.params.detWidth/2;
      const A={x:E.x - ortho.x*half, y:E.y - ortho.y*half};
      const B={x:E.x + ortho.x*half, y:E.y + ortho.y*half};
      return {A,B,E,baseDir,ortho};
    }
    segSegIntersect(P,Q,A,B){
      const r={x:Q.x-P.x,y:Q.y-P.y};
      const s={x:B.x-A.x,y:B.y-A.y};
      const rxs = r.x*s.y - r.y*s.x;
      const qpx = A.x-P.x, qpy=A.y-P.y;
      if (Math.abs(rxs) < 1e-9) return null;
      const t = (qpx*s.y - qpy*s.x) / rxs;
      const u = (qpx*r.y - qpy*r.x) / rxs;
      if (t>0 && t<=1 && u>=0 && u<=1) return t;
      return null;
    }

    _sampleHG(g, rng){
      const U=rng(); let mu;
      if (Math.abs(g)<1e-6){ mu=2*U-1; }
      else { const num=1-g*g, den=1-g+2*g*U; mu=(1/(2*g))*(1+g*g - (num/den)**2); mu=Math.max(-1,Math.min(1,mu)); }
      let th=Math.acos(mu); if(rng()<0.5) th=-th; return th;
    }
    _sampleStepLegacy(rng){
      const STEP_MEAN=26, STEP_JIT=0.6, LONG_P=0.30, LONG_M=2.2;
      let L=STEP_MEAN*(1+STEP_JIT*(2*rng()-1));
      if(rng()<LONG_P) L*=LONG_M;
      return Math.max(6,L);
    }
    _sampleFreePathPx(sigma_t, rng){
      const U=Math.max(1e-9, rng());
      return (-Math.log(U) / Math.max(1e-6, sigma_t)) * this.MFP_PIXELS;
    }
    _sampleAbsorbAfter(mean, rng){
      const p=1/Math.max(1e-6,mean); let k=1; while(rng()>=p) k++; return k;
    }

    resetWave(keepTime=false){
      const W=this.canvas.clientWidth,H=this.canvas.clientHeight; if(this.emitter.y==null) this.emitter.y=H/2;
      const poly=this.buildInterface(W,H,this.params.rough);
      const baseDir=this.buildBaseDir(poly); const ortho={x:-baseDir.y,y:baseDir.x};
      const rng=mulberry32(this.seedEmit++);
      const pCount=this.params.pCount|0;
      this.photons = new Array(pCount).fill(0).map((_,i)=>{
        const dx=gaussian(rng)*this.params.sigPara, dy=gaussian(rng)*this.params.sigOrtho;
        let sx=this.emitter.x+baseDir.x*dx+ortho.x*dy, sy=this.emitter.y+baseDir.y*dx+ortho.y*dy;
        const xSurf=this.xAtY(poly,sy); const margin=6;
        if(sx >= xSurf - margin){ const push=(sx-(xSurf-margin))+1; sx -= baseDir.x*push; sy -= baseDir.y*push; }
        return {
          active:true, medium:'air', pos:{x:sx,y:sy}, dir:{x:baseDir.x,y:baseDir.y},
          noReenter:false, hasReentered: false, stepLeft:0, scatters:0,
          absorbAfter: this._sampleAbsorbAfter(this.ABSORB_MEAN_SCATTERS, mulberry32(this.seedEmit + i*1777)),
          rng: mulberry32(this.seedEmit + i*9773), pathMat:[], isSSS:false
        };
      });
      this.mfFlash = new Array(Math.max(0, poly.length-1)).fill(0);
      this.absorptions = []; this.cachedPoly = poly;
      if(!keepTime){ this.time = 0; this.hitsRed=[]; this.hitsSSS=[]; }
    }

    step(dt){
      if(!this.isPlaying) return;
      this.time += dt;
      if(this.params.autoStop && this.time >= this.params.stopTime) this.isPlaying = false;

      const W=this.canvas.clientWidth,H=this.canvas.clientHeight;
      const speedAir=this.params.speedAir, speedMat=speedAir*0.6;
      const poly = this.cachedPoly || this.buildInterface(W,H,this.params.rough);
      const det = this.currentDetector(poly);

      if (this.mfFlash.length !== Math.max(0, poly.length-1)) this.mfFlash = new Array(Math.max(0, poly.length-1)).fill(0);
      for(let i=0;i<this.mfFlash.length;i++){ if(this.mfFlash[i]>0) this.mfFlash[i]=Math.max(0,this.mfFlash[i]-dt); }
      for(let i=this.absorptions.length-1;i>=0;i--){ this.absorptions[i].t -= dt; if (this.absorptions[i].t<=0) this.absorptions.splice(i,1); }

      const segSeg=(P,Q,A,B)=>this.segSegIntersect(P,Q,A,B);
      const nearestIntersection=(pos,dir,dist,poly)=>{
        const end={x:pos.x+dir.x*dist,y:pos.y+dir.y*dist};
        let best=null, idx=-1;
        for(let i=0;i<poly.length-1;i++){
          const a=poly[i], b=poly[i+1];
          const hit=segSeg(pos,end,{x:a[0],y:a[1]},{x:b[0],y:b[1]});
          if(hit!=null && (best==null || hit<best)){ best=hit; idx=i; }
        }
        if(best==null) return null;
        return {t:best, idx};
      };
      const recordHit=(ph, tHit)=>{ if (ph.isSSS) this.hitsSSS.push(tHit); else this.hitsRed.push(tHit); ph.active=false; };
      const pushMatPath=(ph,px,py,nx,ny)=>{
        if(!ph.pathMat) ph.pathMat=[];
        const dx=nx-px, dy=ny-py; if(dx*dx+dy*dy<0.25) return;
        if(ph.pathMat.length===0) ph.pathMat.push({x:px,y:py});
        ph.pathMat.push({x:nx,y:ny});
        if(ph.pathMat.length>800) ph.pathMat.splice(0, ph.pathMat.length-800);
      };

      if (this.photons.length===0) this.resetWave(true);

      for(const ph of this.photons){
        if(!ph.active) continue;
        let budget = (ph.medium==='air'? speedAir*dt : speedMat*dt);
        let guard=40;
        while(budget>1e-6 && guard-- > 0){
          if (ph.medium==='air'){
            const endAir = {x:ph.pos.x + ph.dir.x*budget, y:ph.pos.y + ph.dir.y*budget};
            const tDet = segSeg(ph.pos, endAir, det.A, det.B);
            if (tDet != null && ph.dir.x < -1e-6) { recordHit(ph, this.time + (budget*tDet)/speedAir); break; }
            const hit=nearestIntersection(ph.pos,ph.dir,budget,poly);
            if (hit){
              const d=budget*hit.t; ph.pos.x+=ph.dir.x*d; ph.pos.y+=ph.dir.y*d; budget-=d;
              const n_air=this.facetNormal(poly,hit.idx,'air'); this.mfFlash[hit.idx]=this.params.showSSS ? this.MF_FLASH_T : 0;
              let transmit = true;
              if (this.params.useFresnel){
                const d_in = norm({x:ph.dir.x, y:ph.dir.y});
                const cosI2 = Math.max(0, -dot(n_air, d_in));
                const R = fresnelRs_sPolar(this.params.nMat, this.params.aCoeff, cosI2);
                if (ph.rng() < R) transmit = false;
              } else { transmit = (ph.rng() >= 0.5); }
              if (!transmit){
                ph.dir = reflect(ph.dir, n_air); ph.pos.x += n_air.x*0.8; ph.pos.y += n_air.y*0.8;
              } else {
                const tdir = refract(ph.dir, n_air, this.N_AIR, this.params.nMat);
                if (tdir){
                  ph.dir = tdir; ph.medium='mat'; ph.pos.x += ph.dir.x*0.8; ph.pos.y += ph.dir.y*0.8;
                  ph.scatters=0; ph.pathMat = [{x:ph.pos.x,y:ph.pos.y}]; ph.isSSS = true;
                  ph.stepLeft = this.params.useFresnel ? this._sampleFreePathPx(this.params.aCoeff + this.params.sCoeff, ph.rng) : this._sampleStepLegacy(ph.rng);
                } else {
                  ph.dir = reflect(ph.dir, n_air); ph.pos.x += n_air.x*0.8; ph.pos.y += n_air.y*0.8;
                }
              }
            } else { ph.pos = endAir; budget=0; }
          } else {
            // Material
            if (this.params.useFresnel){
              if (ph.stepLeft<=0){
                const sa = this.params.aCoeff, ss = this.params.sCoeff;
                if (ph.rng() < (sa / Math.max(1e-9, sa+ss))){ this.absorptions.push({x:ph.pos.x,y:ph.pos.y,t:this.ABSORB_FLASH_T}); ph.active=false; break; }
                const th=this._sampleHG(this.params.hg, ph.rng), c=Math.cos(th), s=Math.sin(th), dx=ph.dir.x, dy=ph.dir.y;
                ph.dir = norm({x:c*dx - s*dy, y:s*dx + c*dy});
                ph.stepLeft = this._sampleFreePathPx(Math.max(1e-9, sa+ss), ph.rng);
              }
            } else {
              if (ph.stepLeft<=0){
                ph.scatters += 1;
                if (ph.scatters >= ph.absorbAfter){ this.absorptions.push({x:ph.pos.x,y:ph.pos.y,t:this.ABSORB_FLASH_T}); ph.active=false; break; }
                const th=this._sampleHG(this.params.hg, ph.rng), c=Math.cos(th), s=Math.sin(th), dx=ph.dir.x, dy=ph.dir.y;
                ph.dir = norm({x:c*dx - s*dy, y:s*dx + c*dy});
                ph.stepLeft = this._sampleStepLegacy(ph.rng);
              }
            }
            const step=Math.min(budget, ph.stepLeft);
            const hit=nearestIntersection(ph.pos, ph.dir, step, poly);
            if (hit){
              const px=ph.pos.x, py=ph.pos.y; const d=step*hit.t; ph.pos.x+=ph.dir.x*d; ph.pos.y+=ph.dir.y*d;
              pushMatPath(ph, px,py, ph.pos.x,ph.pos.y); budget-=d; ph.stepLeft-=d;
              const n_mat=this.facetNormal(poly,hit.idx,'mat'); this.mfFlash[hit.idx]=this.params.showSSS ? this.MF_FLASH_T : 0;
              const tout = refract(ph.dir, n_mat, this.params.nMat, this.N_AIR);
              const d_in = norm({x:ph.dir.x, y:ph.dir.y});
              const cosI = Math.max(0, -dot(n_mat, d_in));
              const Rb = fresnelRs_sPolar(this.params.nMat, this.params.aCoeff, cosI);
              if (tout && tout.x < 0){
                if (this.params.useFresnel && ph.rng() < Rb){
                   ph.dir=reflect(ph.dir, n_mat); ph.pos.x += n_mat.x*0.8; ph.pos.y += n_mat.y*0.8;
                } else {
                   ph.dir=tout; ph.medium='air'; ph.noReenter=true; ph.hasReentered=true; ph.pos.x += ph.dir.x*0.8; ph.pos.y += ph.dir.y*0.8;
                }
              } else {
                ph.dir=reflect(ph.dir, n_mat); ph.pos.x += n_mat.x*0.8; ph.pos.y += n_mat.y*0.8;
              }
            } else {
              const px=ph.pos.x, py=ph.pos.y; ph.pos.x += ph.dir.x*step; ph.pos.y += ph.dir.y*step;
              pushMatPath(ph, px,py, ph.pos.x,ph.pos.y); budget-=step; ph.stepLeft-=step;
            }
          }
        }
        if (ph.active){ if (ph.pos.x<-12 || ph.pos.x>W+12 || ph.pos.y<-12 || ph.pos.y>H+12) ph.active=false; }
      }

      // Calc Fresnel UI
      const midY=H/2; const Hx_mid=this.xAtY(poly,midY);
      let j=0; while(j<poly.length-1 && !(poly[j][1]<=midY && midY<=poly[j+1][1])) j++;
      j = Math.max(0, Math.min(poly.length-2, j));
      const n_mid = this.facetNormal(poly, j, 'air');
      const vIn_mid = norm({x:this.emitter.x-Hx_mid, y:this.emitter.y-midY});
      const cosI_mid = Math.max(0, dot(n_mid, vIn_mid));
      this.lastFresnelR = fresnelRs_sPolar(this.params.nMat, this.params.aCoeff, cosI_mid);
      this.lastThetaDeg = Math.acos(Math.max(-1, Math.min(1, cosI_mid))) * 180/Math.PI;

      let allOff=true; for(const p of this.photons){ if(p.active){ allOff=false; break; } }
      if (allOff && this.absorptions.length===0) this.resetWave(true);
    }

    _roundRect(ctx,x,y,w,h,r){ 
      if(ctx.roundRect) { ctx.roundRect(x,y,w,h,r); return; } 
      ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); 
    }

    drawRealisticPhotodiode(ctx, poly){
      const det = this.currentDetector(poly);
      const W = this.params.detWidth;
      const totalH = 50; 

      const angle = Math.atan2(det.baseDir.y, det.baseDir.x) + Math.PI/2;

      ctx.save();
      ctx.translate(det.E.x, det.E.y);
      ctx.rotate(angle);

      let curY = -totalH / 2;
      const drawRect = (x,y,w,h,color) => {
          ctx.fillStyle = color;
          if(ctx.fillRect) ctx.fillRect(x,y,w,h);
          else { ctx.beginPath(); ctx.rect(x,y,w,h); ctx.fill(); }
      };

      // SiO2
      const h_sio2 = 5; drawRect(-W/2, curY, W, h_sio2, 'rgba(180, 230, 255, 0.6)'); curY += h_sio2;
      // Anode / P+
      const h_anode = 6; const w_contact = W * 0.12; 
      drawRect(-W/2 + w_contact, curY, W - 2*w_contact, h_anode, '#d46a63');
      drawRect(-W/2, curY, w_contact, h_anode, '#b0b0b0');
      drawRect(W/2 - w_contact, curY, w_contact, h_anode, '#b0b0b0'); curY += h_anode;
      // I-Layer
      const h_i = 24; drawRect(-W/2, curY, W, h_i, '#9aa5b1'); curY += h_i;
      // N+
      const h_n = 10; drawRect(-W/2, curY, W, h_n, '#6d5e5a'); curY += h_n;
      // Kathode
      const h_cathode = 5; drawRect(-W/2, curY, W, h_cathode, '#a0a0a0');

      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.rect(-W/2, -totalH/2, W, totalH); ctx.stroke();
      ctx.restore();
    }
    
    draw(targetCtx){
      const W=this.canvas.clientWidth,H=this.canvas.clientHeight;
      const ctx= targetCtx || this.ctx; 
      const poly = this.cachedPoly || this.buildInterface(W,H,this.params.rough);
      const Ey=(typeof this.emitter.y==='number')?this.emitter.y:H/2;

      const midY = H/2; const Hx_mid = this.xAtY(poly, midY);
      let j=0; while(j<poly.length-1 && !(poly[j][1]<=midY && midY<=poly[j+1][1])) j++;
      j = Math.max(0, Math.min(poly.length-2, j));
      const n_mid = this.facetNormal(poly, j, 'air');
      const vIn_mid = norm({x:this.emitter.x - Hx_mid, y:this.emitter.y - midY});
      const cosI_mid = Math.max(0, dot(n_mid, vIn_mid));
      this.lastFresnelR = fresnelRs_sPolar(this.params.nMat, this.params.aCoeff, cosI_mid);
      this.lastThetaDeg = Math.acos(Math.max(-1, Math.min(1, cosI_mid))) * 180/Math.PI;

      if(ctx.clearRect) ctx.clearRect(0,0,W,H); 
      ctx.save(); 
      const cx=W/2,cy=H/2; 
      ctx.translate(cx,cy); 
      ctx.scale(this.params.zoom,this.params.zoom); 
      ctx.translate(-cx,-cy);

      if(ctx.save) ctx.save();
      this._roundRect(ctx,0,0,W,H,12); 
      if(ctx.clip) ctx.clip(); 
      
      ctx.fillStyle=this.colors.mat; 
      if(ctx.fillRect) ctx.fillRect(0,0,W,H); else { ctx.beginPath(); ctx.rect(0,0,W,H); ctx.fill(); }
      
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,H);
      for(let i=poly.length-1;i>=0;i--){ const p=poly[i]; ctx.lineTo(p[0],p[1]); }
      ctx.closePath(); ctx.fillStyle=this.colors.air; ctx.fill();
      if(ctx.restore) ctx.restore();

      // Interface
      if(poly.length>=2){
        ctx.beginPath(); ctx.lineWidth=2; ctx.strokeStyle=this.colors.line; ctx.lineJoin='bevel'; 
        ctx.moveTo(poly[0][0],poly[0][1]); for(let i=1;i<poly.length;i++){ ctx.lineTo(poly[i][0],poly[i][1]); } ctx.stroke();
      }

      // Glow (nur screen)
      if(ctx.globalCompositeOperation) ctx.save();
      if(ctx.globalCompositeOperation) ctx.globalCompositeOperation='lighter';
      if (this.params.showSSS){
        for(let i=0;i<poly.length-1;i++){
          const t=(this.mfFlash[i]||0)/this.MF_FLASH_T; if(t<=0) continue;
          const A=poly[i],B=poly[i+1];
          ctx.beginPath(); ctx.lineWidth=3.2; ctx.strokeStyle='rgba(255,80,80,'+(0.15+0.65*t)+')';
          ctx.moveTo(A[0],A[1]); ctx.lineTo(B[0],B[1]); ctx.stroke();
        }
      }
      for(const a of this.absorptions){
        const k=Math.max(0, Math.min(1, a.t/this.ABSORB_FLASH_T)), r=8+18*(1-k);
        ctx.beginPath();
        // ÄNDERUNG: Farbe von Gelb (255,230,80) auf Weiß (255,255,255) geändert für SVG-Konsistenz
        ctx.fillStyle='rgba(255,255,255,'+(0.25+0.55*k)+')';
        ctx.arc(a.x,a.y,r,0,Math.PI*2);
        ctx.fill();
      }
      if(ctx.globalCompositeOperation) ctx.restore();

      // Photonen
      for(const p of this.photons){
        if(!p.active) continue;
        if (this.params.hideReentry && p.hasReentered && p.medium === 'air') continue;
        if(p.isSSS){ if(!this.params.showSSS) continue; }
        else { if(!this.params.showRed) continue; }
        
        ctx.fillStyle = p.isSSS ? this.colors.sss : this.colors.red;
        ctx.beginPath(); ctx.arc(p.pos.x,p.pos.y,this.params.radius,0,Math.PI*2); ctx.fill();
      }

      // Emitter
      ctx.fillStyle=this.colors.emitter; ctx.beginPath(); ctx.arc(this.emitter.x,Ey,4,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=1; ctx.stroke();

      // NEU: Realistische Photodiode statt einfachem Strich
      this.drawRealisticPhotodiode(ctx, poly);

      // Overlay
      const det = this.currentDetector(poly);
      if (this.params.showGeo){
        const ortho={x:-det.baseDir.y, y:det.baseDir.x};
        const pts=[];
        for(let i=0;i<poly.length-1;i++){
          const A=poly[i],B=poly[i+1]; const M={x:(A[0]+B[0])*0.5, y:(A[1]+B[1])*0.5};
          const rx=M.x-det.E.x, ry=M.y-det.E.y; 
          const s=rx*det.baseDir.x+ry*det.baseDir.y; if(s<-2) continue;
          const w=rx*ortho.x+ry*ortho.y; if(Math.abs(w)<=2*this.params.sigOrtho+1e-6) pts.push(M);
        }
        if(pts.length<2){
           let jj=0; while(jj<poly.length-1 && !(poly[jj][1]<=H/2 && H/2<=poly[jj+1][1])) jj++;
           const targetY = H/2; const targetX = this.xAtY(poly, targetY);
           pts.push({x:targetX, y:targetY});
        }
        let mx=0,my=0; for(const p of pts){ mx+=p.x; my+=p.y; } mx/=pts.length; my/=pts.length;
        
        ctx.beginPath(); ctx.lineWidth=2.6; ctx.lineCap='round'; ctx.strokeStyle=this.colors.ovlIn; 
        ctx.moveTo(det.E.x,det.E.y); ctx.lineTo(mx,my); ctx.stroke();
        
        if(ctx.save) ctx.save(); 
        ctx.lineWidth=1.6; ctx.lineJoin='round'; ctx.lineCap='round';
        ctx.strokeStyle=this.colors.ovlFit; if(ctx.globalAlpha) ctx.globalAlpha=0.45;
        for(const ph of this.photons){
          if(!ph.isSSS || !ph.pathMat || ph.pathMat.length<2) continue;
          ctx.beginPath(); ctx.moveTo(ph.pathMat[0].x,ph.pathMat[0].y);
          for(let i=1;i<ph.pathMat.length;i++){ const q=ph.pathMat[i]; ctx.lineTo(q.x,q.y); }
          ctx.stroke();
        }
        if(ctx.restore) ctx.restore();
      }
      ctx.restore();
    }

    _toWorld(e){
      const R=this.canvas.getBoundingClientRect();
      
      // Fallback für Touch oder Maus
      const clientX = (e.touches && e.touches.length>0) ? e.touches[0].clientX : e.clientX;
      const clientY = (e.touches && e.touches.length>0) ? e.touches[0].clientY : e.clientY;
      
      const mx=clientX-R.left, my=clientY-R.top;
      const W=this.canvas.clientWidth,H=this.canvas.clientHeight;
      const cx=W/2, cy=H/2;
      return {x:cx+(mx-cx)/this.params.zoom, y:cy+(my-cy)/this.params.zoom};
    }
  }
  window.MFSim = MFSim;
})();
