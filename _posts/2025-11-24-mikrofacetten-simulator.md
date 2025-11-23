---
title: "Photonen-Simulator · Mikrofacetten + Detektor"
last_modified_at: 2025-11-24
categories:
  - Physik
  - Simulation
tags:
  - optics
  - javascript
classes: wide
header:
  overlay_color: "#000"
  overlay_filter: "0.5"
  caption: "Echtzeit Raytracing im Browser"
excerpt: "Eine interaktive Simulation zur Lichtstreuung an rauen Oberflächen mit Photodioden-Detektor."
---

Hier ist die interaktive Simulation. Du kannst die Parameter unten links steuern.

<style>
  /* Container, der das Seitenverhältnis erzwingt oder den ganzen Screen füllt */
  .sim-container {
    position: relative;
    width: 100%;
    height: 85vh; /* Nimmt 85% der Bildschirmhöhe ein */
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .sim-iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
</style>

<div class="sim-container">
  <iframe src="/assets/mikrofacetten-sim/index.html" class="sim-iframe" title="Mikrofacetten Simulator" allowfullscreen></iframe>
</div>

Drücke **Leertaste** für Pause/Play und **H** um das Menü auszublenden.
