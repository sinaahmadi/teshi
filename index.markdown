---
layout: home
title: "تەشیڕێس"
dir: rtl
lang: ckb
---

{::nomarkdown}
<div class="dialect-container post-rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>دۆزەرەوەی شێوەزاری کوردی</title>
    <script src="{{ '/assets/js/main.js' | relative_url }}" defer></script>
    <link rel="stylesheet" href="{{ '/assets/css/styles.css' | relative_url }}">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
</head>
<div class="dialect-container post-rtl">
   <div class="language-info">
    <span class="label">زمانەکەت هەڵبژێرە: </span>
    <span class="value">کوردیی ناوەندی</span>
   </div>
   <p>بۆ هەر وشەیەک، شێوەی دەربڕینی خۆت لە شێوەزارەکەت هەڵبژێرە:</p>
  
   <div id="questions-container">
    <!-- Questions will be dynamically inserted here -->
   </div>
   <button id="submit-btn" onclick="predictDialect()" disabled>شێوەزارەکەم دیاری بکە</button>
   <div id="result" style="display: none;">
    <h2>پێشبینی شێوەزارەکەت:</h2>
    <p id="prediction-text"></p>
    <div id="map" style="height: 400px; width: 100%; border-radius: 8px;"></div>
   </div>
</div>
</div>
{:/nomarkdown}

<!-- <userStyle>Normal</userStyle> -->