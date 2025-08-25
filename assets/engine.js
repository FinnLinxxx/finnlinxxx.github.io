/* engine.js — MFSim: Physik + Rendering der linken Seite */
(function(){
  const TAU = Math.PI*2;
  const getCss = (name)=> getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const clamp = (v,a,b)=> Math.max(a, Math.min(b, v));
  const norm = (v)=>{ const L=Math.hypot(v.x,v.y)||1; return {x:v.x/L, y:v.y/L}; };
  const dot = (a,b)=> a.x*b.x + a.y*b.y;

  function reflect(d,n){ d=norm(d); n=norm(n); const k=2*dot(d,n); return norm({x:d.x-k*n.x, y:d.y-k*n.y}); }
  function refract(d,n,n1,n2){
    d=norm(d); n=norm(n);
    let c1 = -dot(n,d);
    if(c1<0){ n={x:-n.x,y:-n.y}; c1 = -dot(n,d); }
    const eta = n1/n2;
    const k = 1 - eta*eta*(1 - c1*c1);
    if(k<0) return null;
    const t = { x: eta*d.x + (eta*c1 - Math.sqrt(k))*n.x,
                y: eta*d.y + (eta*c1 - Math.sqrt(k))*n.y };
    return norm(t);
  }
  function mulberry32(a){ return function(){ let t=a+=0x6D2B79F5; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; } }
  function gaussian(rng){ let u=1-rng(); let v=rng(); return Math.sqrt(-2*Math.log(u))*Math.cos(Math.PI*2*v); }

  // Fresnel (s-Polarisation) mit komplexer Brechzahl m = n + i*k
  function fresnelRs_sPolar(n, k, cosThetaI){
    const sin2 = Math.max(0, 1 - cosThetaI*cosThetaI);
    const n2 = n*n - k*k;
    const nk2 = 2*n*k;
    const a = n2 - sin2;
    const b = nk2;
    const mag = Math.hypot(a, b);
    const t = Math.sqrt((mag + a)/2);
    const u = (b>=0 ? 1 : -1) * Math.sqrt((mag - a)/2);
    const A = cosThetaI - t, B = -u;
    const C = cosThetaI + t, D =  u;
    const denom = C*C + D*D;
    const Re = (A*C + B*D)/denom;
    const Im = (B*C - A*D)/denom;
    return Math.max(0, Math.min(1, Re*Re + Im*Im));
  }

  class MFSim {
    constructor(canvas){
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      // Colors
      this.colors = {
        air:  getCss('--mf-air'),
        mat:  getCss('--mf-mat'),
        line: getCss('--mf-line'),
        red:  getCss('--photon-reflect') || '#ff5d2a',
        sss:  getCss('--photon-sss') || '#8a2be2',
        emitter: getCss('--mf-emitter') || '#00bcd4',
        det: getCss('--detector') || '#f0b93a',
        ovlPlane: getCss('--ovl-plane') || '#6b5cff',
        ovlIn: getCss('--ovl-in') || '#00bcd4',
        ovlArc: getCss('--ovl-arc') || '#202939',
        ovlFit: getCss('--ovl-fit') || '#2ecc71'
      };

      // Params
      this.params = {
        rough: 0.35,
        facetRes: 0.5,
        zoom: 1,
        speedAir: 500,
        pCount: 2000,
        sigPara: 18,
        sigOrtho: 9,
        detWidth: 200,
        showGeo: false,
        showSSS: true,
        showRed: true,
        useFresnel: false,
        nMat: 1.5,
        aCoeff: 0.5, // als k & sigma_a
        sCoeff: 1.0, // sigma_s
        hg: -0.45
      };

      // Constants
      this.N_AIR = 1.0;
      this.MF_FLASH_T = 0.18;
      this.ABSORB_FLASH_T = 0.28;
      this.ABSORB_MEAN_SCATTERS = 8; // für Legacy-Modus
      this.MFP_PIXELS = 30;

      // State
      this.isPlaying = true;
      this.time = 0;
      this.emitter = {x:16, y:null, r:8, dragging:false};
      this.seedGeom=12345; this.seedEmit=67890;
      this.photons=[]; this.mfFlash=[]; this.absorptions=[];
      this.cachedPoly=null;

      // Detector hits
      this.hitsRed=[]; this.hitsSSS=[];

      // Anzeige: Fresnel/Theta
      this.lastFresnelR = null;
      this.lastThetaDeg = null;

      // DPI/init
      this.fitDPI();
      window.addEventListener('resize', ()=>this.fitDPI());
      if(this.emitter.y==null) this.emitter.y=this.canvas.clientHeight/2;

      // Drag emitter
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
        this.resetWave(true); // Geometry bleibt, Partikel neu – Zeit & Hits bleiben
      });
      window.addEventListener('mouseup',()=>{ this.emitter.dragging=false; });

      this.resetWave(false);
    }

    setParam(name, value){
      this.params[name]=value;
      if(name==='rough' || name==='facetRes' || name==='sigPara' || name==='sigOrtho' || name==='pCount'){
        this.resetWave(true);
      }
    }
    getTime(){ return this.time; }
    getHits(){ return {red:this.hitsRed, sss:this.hitsSSS}; }
    getLastFresnel(){ return this.lastFresnelR; }
    getLastThetaDeg(){ return this.lastThetaDeg; }
    setPlaying(p){ this.isPlaying=p; }

    fitDPI(){
      const dpr=Math.min(2, window.devicePixelRatio||1);
      const cssW=this.canvas.clientWidth, cssH=this.canvas.clientHeight;
      this.canvas.width=Math.round(cssW*dpr); this.canvas.height=Math.round(cssH*dpr);
      this.ctx.setTransform(dpr,0,0,dpr,0,0);
    }

    // ===== Geometry =====
    computeN(height, roughVal, facetRes){
      if (roughVal <= 0) return 2;
      const dyMax=80, dyMin=1.0;
      const dy = dyMax * Math.pow(dyMin/dyMax, facetRes);
      const N = Math.round(height / dy) * 5; // ×5 Dichte
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
          active:true,
          medium:'air',
          pos:{x:sx,y:sy},
          dir:{x:baseDir.x,y:baseDir.y},
          noReenter:false,
          stepLeft:0,
          scatters:0,
          absorbAfter: this._sampleAbsorbAfter(this.ABSORB_MEAN_SCATTERS, mulberry32(this.seedEmit + i*1777)), // Legacy-Absorption
          rng: mulberry32(this.seedEmit + i*9773),
          pathMat:[],
          isSSS:false
        };
      });
      this.mfFlash = new Array(Math.max(0, poly.length-1)).fill(0);
      this.absorptions = [];
      this.cachedPoly = poly;
      if(!keepTime){ this.time = 0; this.hitsRed=[]; this.hitsSSS=[]; }
    }

    step(dt){
      if(!this.isPlaying) return;
      this.time += dt;

      const W=this.canvas.clientWidth,H=this.canvas.clientHeight;
      const speedAir=this.params.speedAir, speedMat=speedAir*0.6;
      const EPS=0.8;
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
      const recordHit=(ph, tHit)=>{
        if (ph.isSSS) this.hitsSSS.push(tHit); else this.hitsRed.push(tHit);
        ph.active=false;
      };
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
            if (tDet != null && ph.dir.x < -1e-6) {
              const dist = budget * tDet;
              const tHit = this.time + dist / speedAir;
              recordHit(ph, tHit);
              break;
            }
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
              } else {
                transmit = (ph.rng() >= 0.5);
              }

              if (!transmit){
                ph.dir = reflect(ph.dir, n_air);
                ph.pos.x += n_air.x*0.8; ph.pos.y += n_air.y*0.8;
              } else {
                const tdir = refract(ph.dir, n_air, this.N_AIR, this.params.nMat);
                if (tdir){
                  ph.dir = tdir; ph.medium='mat';
                  ph.pos.x += ph.dir.x*0.8; ph.pos.y += ph.dir.y*0.8;
                  ph.scatters=0; ph.pathMat = [{x:ph.pos.x,y:ph.pos.y}];
                  ph.isSSS = true;
                  if (this.params.useFresnel){
                    const sigma_t = this.params.aCoeff + this.params.sCoeff;
                    ph.stepLeft = this._sampleFreePathPx(sigma_t, ph.rng);
                  } else {
                    ph.stepLeft = this._sampleStepLegacy(ph.rng);
                  }
                } else {
                  ph.dir = reflect(ph.dir, n_air);
                  ph.pos.x += n_air.x*0.8; ph.pos.y += n_air.y*0.8;
                }
              }
            } else { ph.pos = endAir; budget=0; }
          } else {
            if (this.params.useFresnel){
              if (ph.stepLeft<=0){
                const sigma_a = this.params.aCoeff, sigma_s = this.params.sCoeff, sigma_t = Math.max(1e-9, sigma_a + sigma_s);
                const pAbs = sigma_a / sigma_t;
                if (ph.rng() < pAbs){
                  this.absorptions.push({x:ph.pos.x,y:ph.pos.y,t:this.ABSORB_FLASH_T}); // immer einzeichnen
                  ph.active=false; break;
                } else {
                  const theta=this._sampleHG(this.params.hg, ph.rng);
                  const c=Math.cos(theta), s=Math.sin(theta);
                  const dx=ph.dir.x, dy=ph.dir.y;
                  ph.dir = norm({x:c*dx - s*dy, y:s*dx + c*dy});
                  ph.stepLeft = this._sampleFreePathPx(Math.max(1e-9, sigma_a+sigma_s), ph.rng);
                }
              }
              const step=Math.min(budget, ph.stepLeft);
              const hit=nearestIntersection(ph.pos, ph.dir, step, poly);
              if (hit){
                const px=ph.pos.x, py=ph.pos.y;
                const d=step*hit.t; ph.pos.x+=ph.dir.x*d; ph.pos.y+=ph.dir.y*d;
                pushMatPath(ph, px,py, ph.pos.x,ph.pos.y);
                budget-=d; ph.stepLeft-=d;

                const n_mat=this.facetNormal(poly,hit.idx,'mat'); this.mfFlash[hit.idx]= this.params.showSSS ? this.MF_FLASH_T : 0;

                const d_in_mat = norm({x:ph.dir.x, y:ph.dir.y});
                const cosI = Math.max(0, -dot(n_mat, d_in_mat));
                const Rb = fresnelRs_sPolar(this.params.nMat, this.params.aCoeff, cosI);
                const tout = refract(ph.dir, n_mat, this.params.nMat, this.N_AIR);
                if (tout && tout.x < 0){
                  if (ph.rng() < Rb){
                    ph.dir=reflect(ph.dir, n_mat);
                    ph.pos.x += n_mat.x*0.8; ph.pos.y += n_mat.y*0.8;
                  } else {
                    ph.dir=tout; ph.medium='air'; ph.noReenter=true;
                    ph.pos.x += ph.dir.x*0.8; ph.pos.y += ph.dir.y*0.8;
                  }
                } else {
                  ph.dir=reflect(ph.dir, n_mat);
                  ph.pos.x += n_mat.x*0.8; ph.pos.y += n_mat.y*0.8;
                }
              } else {
                const px=ph.pos.x, py=ph.pos.y;
                ph.pos.x += ph.dir.x*step; ph.pos.y += ph.dir.y*step;
                pushMatPath(ph, px,py, ph.pos.x,ph.pos.y);
                budget-=step; ph.stepLeft-=step;
              }
            } else {
              // ===== Legacy-Mechanik mit Absorption nach k Streuungen =====
              if (ph.stepLeft<=0){
                ph.scatters += 1;
                if (ph.scatters >= ph.absorbAfter){
                  this.absorptions.push({x:ph.pos.x,y:ph.pos.y,t:this.ABSORB_FLASH_T}); // immer einzeichnen
                  ph.active=false; break;
                }
                const theta=this._sampleHG(this.params.hg, ph.rng);
                const c=Math.cos(theta), s=Math.sin(theta);
                const dx=ph.dir.x, dy=ph.dir.y;
                ph.dir = norm({x:c*dx - s*dy, y:s*dx + c*dy});
                ph.stepLeft = this._sampleStepLegacy(ph.rng);
              }
              const step=Math.min(budget, ph.stepLeft);
              const hit=nearestIntersection(ph.pos, ph.dir, step, poly);
              if (hit){
                const px=ph.pos.x, py=ph.pos.y;
                const d=step*hit.t; ph.pos.x+=ph.dir.x*d; ph.pos.y+=ph.dir.y*d;
                pushMatPath(ph, px,py, ph.pos.x,ph.pos.y);
                budget-=d; ph.stepLeft-=d;

                const n_mat=this.facetNormal(poly,hit.idx,'mat'); this.mfFlash[hit.idx]=this.params.showSSS ? this.MF_FLASH_T : 0;
                const tout = refract(ph.dir, n_mat, 1.5, this.N_AIR);
                if (tout && tout.x < 0){
                  ph.dir=tout; ph.medium='air'; ph.noReenter=true;
                  ph.pos.x += ph.dir.x*0.8; ph.pos.y += ph.dir.y*0.8;
                } else {
                  ph.dir=reflect(ph.dir, n_mat);
                  ph.pos.x += n_mat.x*0.8; ph.pos.y += n_mat.y*0.8;
                }
              } else {
                const px=ph.pos.x, py=ph.pos.y;
                ph.pos.x += ph.dir.x*step; ph.pos.y += ph.dir.y*step;
                pushMatPath(ph, px,py, ph.pos.x,ph.pos.y);
                budget-=step; ph.stepLeft-=step;
              }
            }
          }
        }
        if (ph.active){
          if (ph.pos.x<-12 || ph.pos.x>W+12 || ph.pos.y<-12 || ph.pos.y>H+12) ph.active=false;
        }
      }

      // Fresnel/Theta Anzeige (Mitte) — (bleibt auch in draw() nochmal, damit Pause+Drag live updaten)
      const midY = H/2;
      const Hx_mid = this.xAtY(poly, midY);
      let j=0; while(j<poly.length-1 && !(poly[j][1]<=midY && midY<=poly[j+1][1])) j++;
      j = Math.max(0, Math.min(poly.length-2, j));
      const n_mid = this.facetNormal(poly, j, 'air');
      const Epos = {x:this.emitter.x, y:this.emitter.y};
      const vIn_mid = norm({x:Epos.x - Hx_mid, y:Epos.y - midY});
      const cosI_mid = Math.max(0, dot(n_mid, vIn_mid));
      this.lastFresnelR = fresnelRs_sPolar(this.params.nMat, this.params.aCoeff, cosI_mid);
      this.lastThetaDeg = Math.acos(Math.max(-1, Math.min(1, cosI_mid))) * 180/Math.PI;

      // Auto-respawn
      let allOff=true; for(const p of this.photons){ if(p.active){ allOff=false; break; } }
      if (allOff && this.absorptions.length===0) this.resetWave(true);
    }

    _roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
    _drawArcBetween(ctx,cx,cy,a0,a1,r,style){
      let da=a1-a0; while(da<=-Math.PI) da+=Math.PI*2; while(da>Math.PI) da-=Math.PI*2;
      const ccw=(da<0); ctx.beginPath(); ctx.strokeStyle=style.color; ctx.lineWidth=style.width||2; ctx.setLineDash(style.dash||[]);
      ctx.arc(cx,cy,r,a0,a1,ccw); ctx.stroke(); ctx.setLineDash([]);
    }

    draw(){
      const W=this.canvas.clientWidth,H=this.canvas.clientHeight;
      const ctx=this.ctx;
      const poly = this.cachedPoly || this.buildInterface(W,H,this.params.rough);
      const Ey=(typeof this.emitter.y==='number')?this.emitter.y:H/2;

      // >>> NEU: Fresnel/Theta auch hier berechnen (damit Pause+Drag live updaten)
      {
        const midY = H/2;
        const Hx_mid = this.xAtY(poly, midY);
        let j=0; while(j<poly.length-1 && !(poly[j][1]<=midY && midY<=poly[j+1][1])) j++;
        j = Math.max(0, Math.min(poly.length-2, j));
        const n_mid = this.facetNormal(poly, j, 'air');
        const vIn_mid = norm({x:this.emitter.x - Hx_mid, y:this.emitter.y - midY});
        const cosI_mid = Math.max(0, dot(n_mid, vIn_mid));
        this.lastFresnelR = fresnelRs_sPolar(this.params.nMat, this.params.aCoeff, cosI_mid);
        this.lastThetaDeg = Math.acos(Math.max(-1, Math.min(1, cosI_mid))) * 180/Math.PI;
      }

      ctx.clearRect(0,0,W,H);
      ctx.save(); const cx=W/2,cy=H/2; ctx.translate(cx,cy); ctx.scale(this.params.zoom,this.params.zoom); ctx.translate(-cx,-cy);

      // Flächen
      this._roundRect(ctx,0,0,W,H,12); ctx.clip();
      ctx.fillStyle=this.colors.mat; ctx.fillRect(0,0,W,H);
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,H);
      for(let i=poly.length-1;i>=0;i--){ const p=poly[i]; ctx.lineTo(p[0],p[1]); }
      ctx.closePath(); ctx.fillStyle=this.colors.air; ctx.fill();

      // Interface
      if(poly.length>=2){
        ctx.beginPath(); ctx.lineWidth=2; ctx.strokeStyle=this.colors.line; ctx.lineJoin='bevel'; ctx.miterLimit=2;
        ctx.moveTo(poly[0][0],poly[0][1]); for(let i=1;i<poly.length;i++){ ctx.lineTo(poly[i][0],poly[i][1]); } ctx.stroke();
      }

      // Facetten-Glow (an SSS gekoppelt) + Absorptionsblitze (immer)
      ctx.save(); ctx.globalCompositeOperation='lighter';
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
        ctx.beginPath(); ctx.fillStyle='rgba(255,230,80,'+(0.25+0.55*k)+')'; ctx.arc(a.x,a.y,r,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();

      // Photonen
      for(const p of this.photons){
        if(!p.active) continue;
        if(p.isSSS){ if(!this.params.showSSS) continue; }
        else { if(!this.params.showRed) continue; }
        ctx.fillStyle = p.isSSS ? this.colors.sss : this.colors.red;
        ctx.beginPath(); ctx.arc(p.pos.x,p.pos.y,2.1,0,Math.PI*2); ctx.fill();
      }

      // Emitter
      ctx.fillStyle=this.colors.emitter; ctx.beginPath(); ctx.arc(this.emitter.x,Ey,4,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=1; ctx.stroke();

      // Detektor-Linie
      const det = this.currentDetector(poly);
      ctx.beginPath(); ctx.lineWidth=4; ctx.strokeStyle=this.colors.det; ctx.lineCap='round';
      ctx.moveTo(det.A.x, det.A.y); ctx.lineTo(det.B.x, det.B.y); ctx.stroke();

      // --- Overlay ---
      if (this.params.showGeo){
        const E = det.E, baseDir = det.baseDir;
        const ortho={x:-baseDir.y, y:baseDir.x};

        const pts=[];
        for(let i=0;i<poly.length-1;i++){
          const A=poly[i],B=poly[i+1]; const M={x:(A[0]+B[0])*0.5, y:(A[1]+B[1])*0.5};
          const rx=M.x-E.x, ry=M.y-E.y; const s=rx*baseDir.x+ry*baseDir.y; if(s<-2) continue;
          const w=rx*ortho.x+ry*ortho.y; if(Math.abs(w)<=2*this.params.sigOrtho+1e-6) pts.push(M);
        }
        if(pts.length<2){
          let jj=0; while(jj<poly.length-1 && !(poly[jj][1]<=H/2 && H/2<=poly[jj+1][1])) jj++;
          const a=Math.max(0,jj-2), b=Math.min(poly.length-1,jj+3);
          for(let k=a;k<b;k++){ const A=poly[k],B=poly[k+1]; pts.push({x:(A[0]+B[0])*0.5, y:(A[1]+B[1])*0.5}); }
        }
        let mx=0,my=0; for(const p of pts){ mx+=p.x; my+=p.y; } mx/=pts.length; my/=pts.length;
        let sxx=0,sxy=0,syy=0; for(const p of pts){ const dx=p.x-mx,dy=p.y-my; sxx+=dx*dx; sxy+=dx*dy; syy+=dy*dy; }
        let thetaPCA=0.5*Math.atan2(2*sxy,sxx-syy); let tdir={x:Math.cos(thetaPCA),y:Math.sin(thetaPCA)}; if(!isFinite(tdir.x)||!isFinite(tdir.y)) tdir={x:0,y:1};
        let uMin=Infinity,uMax=-Infinity; for(const p of pts){ const u=(p.x-mx)*tdir.x+(p.y-my)*tdir.y; if(u<uMin) uMin=u; if(u>uMax) uMax=u; }
        if(!isFinite(uMin)||!isFinite(uMax)||uMax-uMin<2){ uMin-=1; uMax+=1; }
        ctx.save(); ctx.lineWidth=2.4; ctx.lineCap='round'; ctx.strokeStyle=this.colors.ovlFit; ctx.beginPath(); ctx.moveTo(mx+tdir.x*uMin,my+tdir.y*uMin); ctx.lineTo(mx+tdir.x*uMax,my+tdir.y*uMax); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.fillStyle=this.colors.ovlFit; for(const p of pts){ ctx.beginPath(); ctx.arc(p.x,p.y,3,0,Math.PI*2); ctx.fill(); } ctx.restore();

        // Normale (lila)
        const cross=(a,b)=> a.x*b.y - a.y*b.x;
        const d=baseDir,q0={x:mx,y:my}, denom=cross(d,tdir);
        let Hx,Hy; if(Math.abs(denom)<1e-9){ const s=((E.x-q0.x)*tdir.x+(E.y-q0.y)*tdir.y); Hx=q0.x+tdir.x*s; Hy=q0.y+tdir.y*s; }
        else { const lam=cross({x:q0.x-E.x,y:q0.y-E.y},tdir)/denom; Hx=E.x+d.x*lam; Hy=E.y+d.y*lam; }
        let n={x:-tdir.y,y:tdir.x}; if(n.x>0){ n.x=-n.x; n.y=-n.y; }
        const Llen=Math.max(W,H)*1.2;
        ctx.beginPath(); ctx.lineWidth=2.8; ctx.lineCap='round'; ctx.strokeStyle=this.colors.ovlPlane; ctx.moveTo(Hx,Hy); ctx.lineTo(Hx+n.x*Llen,Hy+n.y*Llen); ctx.stroke();

        // Einfallslinie (cyan)
        ctx.beginPath(); ctx.lineWidth=2.6; ctx.lineCap='round'; ctx.strokeStyle=this.colors.ovlIn; ctx.moveTo(E.x,E.y); ctx.lineTo(Hx,Hy); ctx.stroke();

        // Ausfallswinkel (rot, Spiegelung an n)
        const vIn_geo = norm({x:E.x-Hx, y:E.y-Hy});
        const d_in = {x:-vIn_geo.x, y:-vIn_geo.y};
        const r = reflect(d_in, n);
        ctx.beginPath(); ctx.lineWidth=2.6; ctx.lineCap='round'; ctx.strokeStyle=this.colors.red;
        ctx.moveTo(Hx,Hy); ctx.lineTo(Hx + r.x*80, Hy + r.y*80);
        ctx.stroke();

        // Winkelbogen + Beschriftung
        const aN=Math.atan2(n.y,n.x), aIn=Math.atan2(vIn_geo.y,vIn_geo.x);
        const rArc=36;
        this._drawArcBetween(ctx,Hx,Hy,aN,aIn,rArc,{color:this.colors.ovlArc,width:2});
        ctx.fillStyle=this.colors.ovlArc; ctx.font='bold 12px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
        const dotNV=Math.max(-1, Math.min(1, n.x*vIn_geo.x+n.y*vIn_geo.y));
        const phi=Math.acos(dotNV);
        const aHalf=aN+(aIn-aN)/2; const lx=Hx+Math.cos(aHalf)*(rArc+12), ly=Hy+Math.sin(aHalf)*(rArc+12);
        const theta_gon=(phi*200/Math.PI).toFixed(1)+' gon';
        ctx.fillText('θ = '+theta_gon, lx-ctx.measureText('θ = '+theta_gon).width/2, ly+4);

        // Pfade im Material nur bei Overlay
        ctx.save(); ctx.lineWidth=1.6; ctx.lineJoin='round'; ctx.lineCap='round';
        ctx.strokeStyle=getCss('--ovl-fit'); ctx.globalAlpha=0.45;
        for(const ph of this.photons){
          if(!ph.isSSS || !ph.pathMat || ph.pathMat.length<2) continue;
          ctx.beginPath(); ctx.moveTo(ph.pathMat[0].x,ph.pathMat[0].y);
          for(let i=1;i<ph.pathMat.length;i++){ const q=ph.pathMat[i]; ctx.lineTo(q.x,q.y); }
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.restore();
    }

    _toWorld(e){
      const R=this.canvas.getBoundingClientRect();
      const mx=e.clientX-R.left, my=e.clientY-R.top;
      const W=this.canvas.clientWidth,H=this.canvas.clientHeight;
      const cx=W/2, cy=H/2;
      return {x:cx+(mx-cx)/this.params.zoom, y:cy+(my-cy)/this.params.zoom};
    }
  }

  window.MFSim = MFSim;
})();

