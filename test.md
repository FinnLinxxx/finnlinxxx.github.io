---
title: Mikrofacetten-Simulation
layout: none
permalink: /test/
---

<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Mikrofacetten · Simulation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- Assets aus /assets – baseurl-sicher + Cache-Busting -->
  <link rel="stylesheet" href="{{ "/assets/styles.css?v=" | append: site.time | date: '%s' | relative_url }}">
</head>
<body style="margin:0">
  <!-- Deine App -->
  <div id="app-root"></div>

  <script src="{{ "/assets/engine.js?v=" | append: site.time | date: '%s' | relative_url }}"></script>
  <script src="{{ "/assets/app.js?v=" | append: site.time | date: '%s' | relative_url }}"></script>
</body>
</html>
