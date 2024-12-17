class DialectAtlas {
    constructor() {
        this.mapContainer = null;
        this.mapFrame = null;
        this.words = [];
        this.selectedPos = 'هەموو';
    }

    init() {
        const mainContainer = document.createElement('div');
        mainContainer.style.cssText = 'margin-bottom: 20px;';

        // Create collapsible filter section
        const filterSection = document.createElement('div');
        filterSection.className = 'filter-section';
        filterSection.style.cssText = `
            background: #f8f9fa;
            border-radius: 8px;
            margin-bottom: 20px;
            overflow: hidden;
        `;

        // Create header that shows current selection
        const filterHeader = document.createElement('div');
        filterHeader.style.cssText = `
            padding: 12px 15px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #ddd;
            user-select: none;
            font-family: 'Noto Sans Arabic', sans-serif;
        `;
        
        const headerText = document.createElement('span');
        headerText.textContent = 'ڕۆڵی ڕێزمانی / Part of Speech: هەموو / All';
        headerText.id = 'filter-header-text';
        
        const expandIcon = document.createElement('span');
        expandIcon.textContent = '▼';
        expandIcon.style.transition = 'transform 0.3s';

        filterHeader.appendChild(headerText);
        filterHeader.appendChild(expandIcon);

        // Create content container
        const filterContent = document.createElement('div');
        filterContent.style.cssText = `
            display: none;
            padding: 10px;
        `;

        // Add click handler for expand/collapse
        filterHeader.addEventListener('click', () => {
            const isExpanded = filterContent.style.display === 'block';
            filterContent.style.display = isExpanded ? 'none' : 'block';
            expandIcon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        });

        // Create radio buttons
        const radioContainer = document.createElement('div');
        radioContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0px;
            direction: rtl;
        `;

        const options = [
            ['هەموو', 'All'],
            ['ناو', 'Noun'],
            ['ئاوەڵناو', 'Adjective'],
            ['کردار', 'Verb'],
            ['جێناو', 'Pronoun'],
            ['ژمارە', 'Numeral'],
            ['وردەوشە', 'Adposition'],
            ['هتد', 'etc']
        ];

        options.forEach((option, index) => {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = `
                padding: 8px;
                ${index !== options.length - 1 ? 'border-bottom: 1px solid #ddd;' : ''}
            `;

            const label = document.createElement('label');
            label.style.cssText = `
                display: flex;
                align-items: center;
                cursor: pointer;
                font-family: 'Noto Sans Arabic', sans-serif;
            `;

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'pos-filter';
            radio.value = option[0];
            radio.checked = option[0] === 'هەموو';
            radio.style.marginLeft = '10px';
            
            radio.addEventListener('change', (e) => {
                this.selectedPos = e.target.value;
                // Update header text
                headerText.textContent = `ڕۆڵی ڕێزمانی / Part of Speech: ${option[0]} / ${option[1]}`;
                // Close the dropdown after selection
                filterContent.style.display = 'none';
                expandIcon.style.transform = 'rotate(0deg)';
                this.updateWordList();
            });

            const span = document.createElement('span');
            span.textContent = `${option[0]} / ${option[1]}`;
            
            label.appendChild(radio);
            label.appendChild(span);
            wrapper.appendChild(label);
            radioContainer.appendChild(wrapper);
        });

        filterContent.appendChild(radioContainer);
        filterSection.appendChild(filterHeader);
        filterSection.appendChild(filterContent);
        mainContainer.appendChild(filterSection);

        // Create word selector
        const selector = document.createElement('select');
        selector.id = 'word-selector';
        selector.style.cssText = `
            width: 100%;
            padding: 10px;
            font-size: 16px;
            font-family: 'Noto Sans Arabic', sans-serif;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 20px;
            direction: rtl;
        `;
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'وشەیەک هەڵبژێرە / Select a word';
        selector.appendChild(defaultOption);
        
        selector.addEventListener('change', (e) => {
            const line = e.target.value;
            if (line) {
                this.createMap(line);
            }
        });
        
        mainContainer.appendChild(selector);

        // Create map container
        this.mapContainer = document.createElement('div');
        this.mapContainer.style.cssText = `
            width: 100%;
            margin-top: 20px;
        `;
        
        this.mapFrame = document.createElement('iframe');
        this.mapFrame.style.cssText = `
            width: 100%;
            height: 500px;
            border: 1px solid #ddd;
            border-radius: 8px;
        `;
        this.mapFrame.setAttribute('scrolling', 'no');
        
        this.mapContainer.appendChild(this.mapFrame);
        mainContainer.appendChild(this.mapContainer);

        // Add everything to the dialect-atlas container
        const container = document.getElementById('dialect-atlas');
        container.appendChild(mainContainer);
        
        this.loadWordList();
    }

    async loadWordList() {
        try {
            const response = await fetch(`${MAPS_BASE_URL}/variants.tsv`);
            if (!response.ok) {
                throw new Error(`Failed to fetch TSV: ${response.status}`);
            }
            
            const text = await response.text();
            const lines = text.trim().split('\n');
            this.words = lines.slice(1); // Skip header
            this.updateWordList();
        } catch (error) {
            console.error('Error loading word list:', error);
        }
    }

    updateWordList() {
        const selector = document.getElementById('word-selector');
        
        // Clear existing options except the default one
        while (selector.options.length > 1) {
            selector.remove(1);
        }

        // Filter and sort words
        const filteredWords = this.words
            .filter(line => {
                if (this.selectedPos === 'هەموو') return true;
                const columns = line.split('\t');
                const pos = columns[5].trim();
                return pos === this.selectedPos;
            })
            .sort((a, b) => {
                const wordA = a.split('\t')[4];
                const wordB = b.split('\t')[4];
                return wordA.localeCompare(wordB, 'ckb-IQ');
            });

        // Add filtered and sorted words to selector
		filteredWords.forEach(line => {
		    const columns = line.split('\t');
		    const option = document.createElement('option');
		    option.value = line;
		    const posTag = columns[5].trim();
		    const englishPOS = {
		        'ناو': 'noun',
		        'ئاوەڵناو': 'adjective',
		        'کردار': 'verb',
		        'جێناو': 'pronoun',
		        'ژمارە': 'numeral',
		        'وردەوشە': 'adposition',
		        'هتد': 'etc'
		    };
		    option.textContent = `${columns[4]} (${posTag} / ${englishPOS[posTag] || ''})`;
		    selector.appendChild(option);
		});
    }

	createMap(line) {
        // Parse the TSV line into variants
        const columns = line.split('\t');
        
        // Fixed mapping of regions to colors
        const regionColors = {
            1: "#29a4c3",  // Ardalanî (Sanandaj)
            2: "#318db2",  // Babanî (Sulaimanyah)
            3: "#003b61",  // Mukryanî (Mahabad)
            4: "#046997",  // Hewlêrî (Erbil)
        };
        
        // Map variants by index
        const variants = {
            0: columns[4],    // Central Kurdish
            1: columns[2],    // Ardalanî (Sanandaj)
            2: columns[3],    // Babanî (Sulaimanyah)
            3: columns[0],    // Mukryanî (Mahabad)
            4: columns[1]     // Hewlêrî (Erbil)
        };
        
        const labelPositions = {
            1: [46.75, 35],     // Ardalanî
            2: [45.2, 35.28],   // Babanî
            3: [45.7, 36.4],    // Mukryanî
            4: [44.1, 35.95]    // Hewlêrî
        };

        const mapHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"/>
                <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"><\/script>
                <style>
                    body { margin: 0; padding: 0; }
                    #map { width: 100%; height: 100vh; }
                    .city-label { background: none; border: none; }
                    .leaflet-div-icon { background: none; border: none; }
                </style>
            </head>
            <body>
                <div id="map"></div>
                <script>
                    const map = L.map('map', {
                        center: [35.8, 45.5],
                        zoom: 7,
                        zoomControl: true
                    });
                    
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: 'Created by Sina Ahmadi | © OpenStreetMap contributors'
                    }).addTo(map);

                    // City markers
                    const cities = {
                        'Sanandaj': [35.3219, 47.0059],
                        'Sulaymaniyah': [35.5556, 45.4329],
                        'Erbil': [36.1911, 44.0088],
                        'Mahabad': [36.7682, 45.7222]
                    };

                    // Add city markers with improved labels
                    Object.entries(cities).forEach(([city, [lat, lon]]) => {
                        // Add dot
                        L.circleMarker([lat, lon], {
                            radius: 5,
                            color: 'red',
                            fill: true,
                            fillOpacity: 1,
                            weight: 1
                        }).addTo(map);

                        // Add label
                        L.marker([lat + 0.02, lon], {
                            icon: L.divIcon({
                                html: \`<div style="
                                    font-size: 10px;
                                    color: black;
                                    text-align: center;
                                ">\${city}</div>\`,
                                className: 'city-label',
                                iconSize: [0, 0]
                            })
                        }).addTo(map);
                    });

                    // Add regions with fixed colors
                    const geojsonData = ${JSON.stringify(window.REGIONS_GEOJSON)};
                    const variants = ${JSON.stringify(variants)};
                    const labelPositions = ${JSON.stringify(labelPositions)};
                    const regionColors = ${JSON.stringify(regionColors)};

                    // Add regions
                    geojsonData.features.forEach((feature, index) => {
                        if (index > 0) {  // Skip the first feature (Central Kurdish)
                            const variantText = variants[index];
                            const color = regionColors[index];

                            // Add colored region
                            L.geoJSON(feature, {
                                style: {
                                    fillColor: color,
                                    color: 'black',
                                    weight: 1,
                                    fillOpacity: 0.7
                                }
                            }).addTo(map);

                            // Add word label
                            if (labelPositions[index]) {
                                const [lon, lat] = labelPositions[index];
                                L.marker([lat, lon], {
                                    icon: L.divIcon({
                                        html: \`<div dir="rtl" style="
                                            background-color: white;
                                            border: 1px solid black;
                                            border-radius: 3px;
                                            padding: 3px 6px;
                                            font-family: 'Noto Sans Arabic', Arial, sans-serif;
                                            font-size: 16px;
                                            font-weight: bold;
                                            text-align: center;
                                            direction: rtl;
                                            unicode-bidi: bidi-override;
                                            white-space: nowrap;
                                            box-sizing: border-box;
                                            display: inline-block;
                                        ">\${variantText}</div>\`,
                                        className: 'word-label',
                                        iconSize: [0, 0],
                                        iconAnchor: [40, 15]
                                    })
                                }).addTo(map);
                            }
                        }
                    });
                <\/script>
            </body>
            </html>
        `;
        
        
        // Set the map HTML
        this.mapFrame.srcdoc = mapHtml;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const atlas = new DialectAtlas();
    atlas.init();
});