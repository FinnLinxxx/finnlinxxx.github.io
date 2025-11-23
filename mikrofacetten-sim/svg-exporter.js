/* svg-exporter.js - Minimaler Mock-Context für SVG Export */
class SVGContext {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.buffer = [];
    this.currentPath = "";
    this.fillStyle = "#000000";
    this.strokeStyle = "#000000";
    this.lineWidth = 1;
    this.globalAlpha = 1;
    this.lineCap = "butt";
    this.lineJoin = "miter";
    
    // Stack speichert jetzt den Typ der Gruppe
    this.groups = []; 
    this.buffer.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
    this.buffer.push(`<rect width="100%" height="100%" fill="#ffffff"/>`);
  }

  _parseColor(colorStr) {
    let color = colorStr;
    let opacity = 1;
    if (typeof colorStr === 'string' && colorStr.trim().startsWith('rgba')) {
        const parts = colorStr.match(/[\d.]+/g);
        if (parts && parts.length >= 4) {
            color = `rgb(${parts[0]},${parts[1]},${parts[2]})`;
            opacity = parts[3];
        }
    }
    return { color, opacity };
  }

  // --- State Management ---
  save() {
    // Typ 'save' markiert einen expliziten Speicherpunkt
    this.groups.push({ type: 'save', alpha: this.globalAlpha });
    this.buffer.push(`<g>`);
  }

  restore() {
    if (this.groups.length === 0) return;

    // LOGIK-FIX: Schließe alle Transformations-Gruppen ('implicit'), 
    // bis wir beim zugehörigen 'save' ankommen.
    while(true) {
        if (this.groups.length === 0) break;
        
        const group = this.groups.pop();
        this.buffer.push(`</g>`);

        // Wenn wir das 'save' geschlossen haben, sind wir fertig mit diesem Restore-Schritt
        if (group.type === 'save') {
            this.globalAlpha = group.alpha; // Restore alpha state
            break;
        }
    }
  }

  translate(x, y) {
    this.buffer.push(`<g transform="translate(${x},${y})">`);
    this.groups.push({ type: 'implicit' }); // Implizite Gruppe (wird von restore automatisch mitgeschlossen)
  }
  
  scale(x, y) {
    this.buffer.push(`<g transform="scale(${x},${y})">`);
    this.groups.push({ type: 'implicit' });
  }
  
  rotate(angle) {
    const degrees = angle * 180 / Math.PI;
    this.buffer.push(`<g transform="rotate(${degrees})">`);
    this.groups.push({ type: 'implicit' });
  }
  
  // --- Path Construction ---
  beginPath() { this.currentPath = ""; }
  moveTo(x, y) { this.currentPath += `M ${x} ${y} `; }
  lineTo(x, y) { this.currentPath += `L ${x} ${y} `; }
  closePath() { this.currentPath += "Z "; }
  
  arc(x, y, r, startAngle, endAngle, counterClockwise) {
    const startX = x + r * Math.cos(startAngle);
    const startY = y + r * Math.sin(startAngle);
    const endX = x + r * Math.cos(endAngle);
    const endY = y + r * Math.sin(endAngle);
    
    if (Math.abs(endAngle - startAngle) >= Math.PI * 2) {
        this.currentPath += `M ${x-r} ${y} A ${r} ${r} 0 1 0 ${x+r} ${y} A ${r} ${r} 0 1 0 ${x-r} ${y} `;
        return;
    }
    const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
    const sweep = counterClockwise ? 0 : 1;
    
    if (this.currentPath.length === 0) {
        this.currentPath += `M ${startX} ${startY} `;
    } else {
        this.currentPath += `L ${startX} ${startY} `;
    }
    this.currentPath += `A ${r} ${r} 0 ${largeArc} ${sweep} ${endX} ${endY} `;
  }

  arcTo(x1, y1, x2, y2, r) {
      this.lineTo(x1, y1); 
  }

  rect(x, y, w, h) {
      this.currentPath += `M ${x} ${y} L ${x+w} ${y} L ${x+w} ${y+h} L ${x} ${y+h} Z `;
  }

  // --- Drawing ---
  fill() {
    if (!this.currentPath) return;
    const { color, opacity } = this._parseColor(this.fillStyle);
    this.buffer.push(`<path d="${this.currentPath}" fill="${color}" stroke="none" fill-opacity="${opacity}" />`);
  }

  stroke() {
    if (!this.currentPath) return;
    const { color, opacity } = this._parseColor(this.strokeStyle);
    this.buffer.push(`<path d="${this.currentPath}" fill="none" stroke="${color}" stroke-width="${this.lineWidth}" stroke-opacity="${opacity}" stroke-linecap="${this.lineCap}" stroke-linejoin="${this.lineJoin}" />`);
  }

  fillRect(x,y,w,h){
      const { color, opacity } = this._parseColor(this.fillStyle);
      this.buffer.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" fill-opacity="${opacity}" />`);
  }
  
  clearRect(x,y,w,h) { }
  clip() { }
  setLineDash() {}
  
  // --- Output ---
  getSerializedSvg() {
    while(this.groups.length > 0) {
        this.buffer.push(`</g>`);
        this.groups.pop();
    }
    this.buffer.push(`</svg>`);
    return this.buffer.join('\n');
  }
}
window.SVGContext = SVGContext;
