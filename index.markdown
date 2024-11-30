---
layout: home
---
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Kurdish Dialect Detector</title>
    <script src="{{ '/assets/js/main.js' | relative_url }}" defer></script>
	<link rel="stylesheet" href="{{ '/assets/css/styles.css' | relative_url }}">
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
	<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
	<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
</head>

<div class="dialect-container">
<!--   <div class="title-container">
    <img src="{{ '/assets/teshi_logo.png' | relative_url }}" alt="Logo" class="logo">
    <h1>Dialect Detector</h1>
  </div> -->
    
   <div class="language-info">
    <span class="label">Select your language: </span>
    <span class="value">Central Kurdish</span>
  </div>


  <p>Select how you say each word in your dialect:</p>
  
  <div id="questions-container">
    <!-- Questions will be dynamically inserted here -->
  </div>

  <button id="submit-btn" onclick="predictDialect()" disabled>Detect My Dialect</button>

  <div id="result" style="display: none;">
    <h2>Your dialect prediction:</h2>
    <p id="prediction-text"></p>
    <div id="map" style="height: 400px; width: 100%; border-radius: 8px;"></div>
  </div>
</div>