// Global variables to store data
let allDialectData = [];
let map;
let markers = [];
let circles = [];
const processedStandardWords = new Set();

const EPICENTERS = {
    'Sulaimanyah': { lat: 35.5548, lng: 45.4479 },
    'Sanandaj': { lat: 35.3219, lng: 46.9862 },
    'Erbil': { lat: 36.1911, lng: 44.0091 },
    'Mahabad': { lat: 36.7656, lng: 45.7222 }
};

const dialectNames = {
    'Sulaimanyah': 'سلێمانی (بابانی)',
    'Erbil': 'هەولێر (هەولێری)',
    'Sanandaj': 'سنە (ئەردەڵانی)',
    'Mahabad': 'مەهاباد (موکریانی)'
};

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize map
    map = L.map('map', {
        center: [35.9, 45.5], // Center of Kurdish region
        zoom: 7
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    document.getElementById('result').style.display = 'none';

    try {
        document.getElementById('questions-container').innerHTML = '<p>Loading word list...</p>';
        
        const [morphoSyntacticData, termsData, tsvData] = await Promise.all([
            fetchJSON('https://raw.githubusercontent.com/sinaahmadi/CORDI/refs/heads/main/MT/morphosyntactic_variations.json'),
            fetchJSON('https://raw.githubusercontent.com/sinaahmadi/CORDI/refs/heads/main/MT/terms.json'),
            fetchTSV('https://raw.githubusercontent.com/sinaahmadi/CORDI/refs/heads/main/MT/morphsyntacitic_lexical.tsv')
        ]);

        // Process all data
        Object.entries(morphoSyntacticData).forEach(([standard, variants]) => processEntry(standard, variants));
        Object.entries(termsData).forEach(([standard, variants]) => processEntry(standard, variants));
        processTSVData(tsvData);
        
        if (allDialectData.length > 0) {
            initializeQuestions();
        } else {
            throw new Error('No dialect data was processed');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('questions-container').innerHTML = 
            `<p style="color: red">Error loading dialect data: ${error.message}</p>`;
    }
});

async function shareResult() {
    const resultDiv = document.getElementById('result');
    const customMessageText = document.querySelector('.custom-message').textContent.trim();
    const shareUrl = 'https://sinaahmadi.github.io/teshi/';

    try {
        if (navigator.canShare && navigator.canShare({ files: [] })) {
            const canvas = await html2canvas(resultDiv);
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const file = new File([blob], 'dialect-prediction.png', { type: 'image/png' });

            await navigator.share({
                text: `${customMessageText}\n\n${shareUrl}`,  // Add double newline
                files: [file],
                url: shareUrl
            });
        } 
        else if (navigator.share) {
            await navigator.share({
                text: `${customMessageText}\n\n${shareUrl}`,  // Add double newline
                url: shareUrl
            });
        }
        else {
            await navigator.clipboard.writeText(`${customMessageText}\n\n${shareUrl}`);  // Add double newline
            alert('Result copied to clipboard! You can now paste it anywhere.');
        }
    } catch (error) {
        console.error('Error sharing:', error);
        const textArea = document.createElement('textarea');
        textArea.value = `${customMessageText}\n\n${shareUrl}`;  // Add double newline
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Result copied to clipboard! You can now paste it anywhere.');
    }
}

async function shareToX() {
    const customMessageText = document.querySelector('.custom-message').textContent.trim();
    const text = encodeURIComponent(`${customMessageText}\n\n`);  // Add double newline
    const url = encodeURIComponent('https://sinaahmadi.github.io/teshi/');
    window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}

async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    return await response.json();
}

async function fetchTSV(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    const text = await response.text();
    return parseTSV(text);
}

function parseTSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split('\t').map(h => h.trim());
    return lines.slice(1).map(line => {
        const values = line.split('\t');
        const entry = {};
        headers.forEach((header, index) => {
            entry[header] = values[index]?.trim() || '';
        });
        return entry;
    });
}

function processEntry(standard, variants) {
    // Skip if we've already processed this standard word
    if (processedStandardWords.has(standard)) return;
    
    const entry = {
        word: standard,
        variants: []
    };

    const dialectMap = {
        'SL': 'Sulaimanyah',
        'SN': 'Sanandaj',
        'HW': 'Erbil',
        'MH': 'Mahabad'
    };

    const uniqueVariants = new Map();

    for (const [dialect, value] of Object.entries(variants)) {
        if (value && dialectMap[dialect]) {
            if (uniqueVariants.has(value)) {
                uniqueVariants.get(value).regions.push(dialectMap[dialect]);
            } else {
                uniqueVariants.set(value, {
                    text: value,
                    regions: [dialectMap[dialect]]
                });
            }
        }
    }

    entry.variants = Array.from(uniqueVariants.values());

    if (entry.variants.length >= 2) {
        allDialectData.push(entry);
        processedStandardWords.add(standard);  // Mark this word as processed
    }
}

function processTSVData(tsvData) {
    tsvData.forEach(row => {
        if (!row.Standard || processedStandardWords.has(row.Standard)) return;

        const entry = {
            word: row.Standard,
            variants: []
        };

        const dialectColumns = {
            'Sulaymaniyah': 'Sulaimanyah',
            'Sanandaj': 'Sanandaj',
            'Erbil': 'Erbil',
            'Mahabad': 'Mahabad'
        };

        const uniqueVariants = new Map();

        Object.entries(dialectColumns).forEach(([col, region]) => {
            if (row[col]) {
                if (uniqueVariants.has(row[col])) {
                    uniqueVariants.get(row[col]).regions.push(region);
                } else {
                    uniqueVariants.set(row[col], {
                        text: row[col],
                        regions: [region]
                    });
                }
            }
        });

        entry.variants = Array.from(uniqueVariants.values());

        if (entry.variants.length >= 2) {
            allDialectData.push(entry);
            processedStandardWords.add(row.Standard);  // Mark this word as processed
        }
    });
}

function initializeQuestions() {
    const selectedWords = shuffleArray(allDialectData).slice(0, 10);
    const container = document.getElementById('questions-container');
    container.innerHTML = '';
    
    if (selectedWords.length === 0) {
        container.innerHTML = '<p>No words with sufficient dialect variations found.</p>';
        return;
    }
    
    selectedWords.forEach((wordData, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        
        const select = document.createElement('select');
        select.id = `question-${index}`;
        select.className = 'dialect-select';
        select.onchange = checkAllAnswered;
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select variation';
        select.appendChild(defaultOption);
        
        wordData.variants.forEach(variant => {
            const option = document.createElement('option');
            option.value = JSON.stringify(variant);
            option.textContent = variant.text;
            select.appendChild(option);
        });
        
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        wordSpan.textContent = wordData.word;
        
        questionDiv.appendChild(select);
        questionDiv.appendChild(wordSpan);
        container.appendChild(questionDiv);
    });
}

function checkAllAnswered() {
    const selects = document.querySelectorAll('select');
    const allAnswered = Array.from(selects).every(select => select.value !== '');
    document.getElementById('submit-btn').disabled = !allAnswered;
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function predictDialect() {
    const selects = document.querySelectorAll('select');
    const regionCounts = {
        'Sulaimanyah': 0,
        'Sanandaj': 0,
        'Erbil': 0,
        'Mahabad': 0
    };
    
    // Count region occurrences
    selects.forEach(select => {
        if (select.value) {
            const variant = JSON.parse(select.value);
            variant.regions.forEach(region => {
                regionCounts[region] = (regionCounts[region] || 0) + 1;
            });
        }
    });
    
    const total = Object.values(regionCounts).reduce((a, b) => a + b, 0);
    
    // Sort regions by count for display
    const sortedRegions = Object.entries(regionCounts)
        .sort(([,a], [,b]) => b - a);
    
    // Clear previous markers and circles
    markers.forEach(marker => marker.remove());
    circles.forEach(circle => circle.remove());
    markers = [];
    circles = [];
    
    // Add markers and circles for all regions
    sortedRegions.forEach(([region, count]) => {
        const percentage = ((count / total) * 100).toFixed(1);
        const coords = EPICENTERS[region];
        
        // Add marker with popup
        const marker = L.marker([coords.lat, coords.lng])
            .bindPopup(`${region}: ${percentage}%`)
            .addTo(map);
        markers.push(marker);
        
        // Determine circle color based on region
        const circleColor = '#4CAF50';
        
        // Add circle with opacity based on percentage and consistent border
        const circle = L.circle([coords.lat, coords.lng], {
            color: circleColor,
            fillColor: circleColor,
            fillOpacity: percentage > 0 ? percentage / 100 : 0.01,
            weight: 2,
            opacity: 2,
            radius: 110000
        }).addTo(map);
        circles.push(circle);
    });
    
    // Get the most probable dialect
    const mostProbableRegion = sortedRegions[0][0];
    const mostProbableDialect = dialectNames[mostProbableRegion];


    // Add a red marker for the most probable region
    const redIcon = L.icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    const mostProbableCoords = EPICENTERS[mostProbableRegion];
    const mostProbableMarker = L.marker([mostProbableCoords.lat, mostProbableCoords.lng], { icon: redIcon })
        .bindPopup(`${mostProbableRegion}: ${((regionCounts[mostProbableRegion] / total) * 100).toFixed(1)}%`)
        .addTo(map);
    markers.push(mostProbableMarker);


    // Calculate group percentages
    const southernPercentage = ((regionCounts['Sulaimanyah'] + regionCounts['Sanandaj']) / total * 100).toFixed(1);
    const northernPercentage = ((regionCounts['Erbil'] + regionCounts['Mahabad']) / total * 100).toFixed(1);

    const predictionText = [
   	  `Teşî predicts that your dialect is closest to that of ${mostProbableRegion} (${mostProbableDialect}).`,
      '',
      `🔵 Northern Central Kurdish: ${northernPercentage}%`,
      `&nbsp;&nbsp;&nbsp;&nbsp;🏰 Erbil: ${((regionCounts['Erbil'] / total) * 100).toFixed(1)}%`,
      `&nbsp;&nbsp;&nbsp;&nbsp;🌄 Mahabad: ${((regionCounts['Mahabad'] / total) * 100).toFixed(1)}%`,
      '',
      // Empty line for spacing
      `🟡 Southern Central Kurdish: ${southernPercentage}%`,
      `&nbsp;&nbsp;&nbsp;&nbsp;🏛️ Sulaimanyah: ${((regionCounts['Sulaimanyah'] / total) * 100).toFixed(1)}%`,
      `&nbsp;&nbsp;&nbsp;&nbsp;👑 Sanandaj: ${((regionCounts['Sanandaj'] / total) * 100).toFixed(1)}%`
    ].join('<br style="text-align: left;">');

    // Get the most probable dialect
    // const mostProbableRegion = sortedRegions[0][0];

    let customMessage = '';
    if (mostProbableRegion === 'Sanandaj') {
        customMessage = `
        <div class="custom-message" style="background-color: #f0f0f0; padding: 10px; text-align: right; font-family: 'Noto Sans Arabic', sans-serif; font-size: 18px;">
ئەزانی چەوگە؟ #تەشی وازانێ شێوەزارەکەم ئەردەڵانییە 😁<br>
🏛️ سلێمانی (بابانی): %${((regionCounts['Sulaimanyah'] / total) * 100).toFixed(1)}<br>
👑 سنە (ئەردەڵانی): %${((regionCounts['Sanandaj'] / total) * 100).toFixed(1)}<br>
🏰 هەولێر (هەولێری): %${((regionCounts['Erbil'] / total) * 100).toFixed(1)}<br>
🌄 مەهاباد (موکریانی): %${((regionCounts['Mahabad'] / total) * 100).toFixed(1)}<br>
ئەی شێوەزارەکەی تۆ چەس؟ ئیسە تاقی کەرەو لێرە!<br>
        </div>
        `;
    } else if (mostProbableRegion === 'Erbil') {
        customMessage = `
    <div class="custom-message" style="background-color: #f0f0f0; padding: 10px; text-align: right; font-family: 'Noto Sans Arabic', sans-serif; font-size: 18px;">
ئەوجە کووتان تێبگەیەنم ئێستا؟!  #تەشی بە هەولێریم دەزانی 😁<br>
🏛️ سلێمانی (بابانی): %${((regionCounts['Sulaimanyah'] / total) * 100).toFixed(1)}<br>
👑 سنە (ئەردەڵانی): %${((regionCounts['Sanandaj'] / total) * 100).toFixed(1)}<br>
🏰 هەولێر (هەولێری): %${((regionCounts['Erbil'] / total) * 100).toFixed(1)}<br>
🌄 مەهاباد (موکریانی): %${((regionCounts['Mahabad'] / total) * 100).toFixed(1)}<br>
ئەدی شێوەزارەکەی تۆ چییە؟ ئێستە تاقی کەوە لێرەدا!<br>
        </div>
        `;
    } else if (mostProbableRegion === 'Mahabad') {
        customMessage = `
    <div class="custom-message" style="background-color: #f0f0f0; padding: 10px; text-align: right; font-family: 'Noto Sans Arabic', sans-serif; font-size: 18px;">
بە خوڵای پێم سەیرە #تەشی چۆن وا دەزانێ خەڵکی موکریانم! 😁<br>
🏛️ سلێمانی (بابانی): %${((regionCounts['Sulaimanyah'] / total) * 100).toFixed(1)}<br>
👑 سنە (ئەردەڵانی): %${((regionCounts['Sanandaj'] / total) * 100).toFixed(1)}<br>
🏰 هەولێر (هەولێری): %${((regionCounts['Erbil'] / total) * 100).toFixed(1)}<br>
🌄 مەهاباد (موکریانی): %${((regionCounts['Mahabad'] / total) * 100).toFixed(1)}<br>
ئەدی بۆ بۆخۆت تاقی ناکەیەوە بزانی شێوەزارەکەت ئی کۆیە؟<br>
        </div>
        `;
    } else if (mostProbableRegion === 'Sulaimanyah') {
        customMessage = `
    <div class="custom-message" style="background-color: #f0f0f0; padding: 10px; text-align: right; font-family: 'Noto Sans Arabic', sans-serif; font-size: 18px;">
با پێو بڵێم! #تەشی گومان ئەکا خەڵکی سلێمانیم 😁<br>
🏛️ سلێمانی (بابانی): %${((regionCounts['Sulaimanyah'] / total) * 100).toFixed(1)}<br>
👑 سنە (ئەردەڵانی): %${((regionCounts['Sanandaj'] / total) * 100).toFixed(1)}<br>
🏰 هەولێر (هەولێری): %${((regionCounts['Erbil'] / total) * 100).toFixed(1)}<br>
🌄 مەهاباد (موکریانی): %${((regionCounts['Mahabad'] / total) * 100).toFixed(1)}<br>
وەرن خەڵک ئاگادار کەینەوانێ شێوەزارەکەیان تاقی کەنەوانێ!<br>
        </div>
        `;
    }

    customMessage += `
        <div class="share-buttons" style="text-align: center; margin-top: 15px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
            <button onclick="shareToX()" class="share-btn" style="background-color: #000000;">
                <span>Share on X</span> 
            </button>
            <button onclick="shareResult()" class="share-btn" style="background-color: #666;">
                <span>📤</span> Copy Result
            </button>
        </div>
    `;

    const predictionTextDiv = document.createElement('div');
    predictionTextDiv.id = 'prediction-text-div';
    predictionTextDiv.innerHTML = predictionText;

    const customMessageDiv = document.createElement('div');
    customMessageDiv.id = 'custom-message-div';
    customMessageDiv.innerHTML = customMessage;

    const resultDiv = document.getElementById('result');
    while (resultDiv.firstChild) {
        resultDiv.removeChild(resultDiv.firstChild);
    }
    
    resultDiv.style.display = 'block';
    resultDiv.appendChild(predictionTextDiv);
    resultDiv.appendChild(map.getContainer());
    resultDiv.appendChild(customMessageDiv);

    map.invalidateSize();
    
    // Fit map to show all markers
    if (markers.length > 0) {
        const group = new L.featureGroup(markers.concat(circles));
        map.fitBounds(group.getBounds().pad(0.2));
    }
}