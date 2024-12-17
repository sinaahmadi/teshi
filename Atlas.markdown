---
layout: post-rtl
title: "ئەتڵەس"
date: 2024-12-03 01:16:54 +0100
categories: jekyll update
lang: ckb
direction: rtl
---

<script src="{{ '/assets/js/dialect-atlas.js' | relative_url }}"></script>


<script>
    var MAPS_BASE_URL = '{{ "/assets/maps" | relative_url }}';
    // Load GeoJSON data
    fetch('{{ "/assets/maps/regions.geojson" | relative_url }}')
        .then(response => response.json())
        .then(data => {
            window.REGIONS_GEOJSON = data;
            // Debug log to see feature properties
            data.features.forEach(feature => {
                console.log('Region properties:', feature.properties);
            });
        });
</script>

<!-- In your post's header -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>

<!-- Rest of your post content -->

<!-- Atlas Container -->
<div id="dialect-atlas"></div>

<!-- Add necessary styles -->
<style>
.word-selector {
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    font-size: 16px;
    font-family: 'Noto Sans Arabic', sans-serif;
    border: 1px solid #ddd;
    border-radius: 4px;
}

#map-container {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
}

body { 
    margin: 0;
    padding: 0;
}
#map { 
    width: 100%;
    height: 100vh;
    background: transparent;
}
.leaflet-control-attribution {
    font-size: 11px;
    padding: 2px 8px;
    background-color: rgba(255, 255, 255, 0.8) !important;
}

.city-label { background: none; border: none; }
.word-label div { box-shadow: 1px 1px 3px rgba(0,0,0,0.1); }

</style>

<!-- Include the atlas script -->
<!-- <script src="{{ '/assets/js/dialect-atlas.js' | relative_url }}"></script> -->