let map;
let countries = [];
let currentCountry;
let currentQuestion = 1;
let score = 0;
let selectedCountry = null;
let countryPolygons = [];
let currentGameMode = 'world'; // Default game mode

let gameModes = {
    'world': 'World Countries',
    'europe': 'European Countries',
    'africa': 'African Countries',
    'asia': 'Asian Countries',
    'americas': 'American Countries',
    'us-states': 'US States'
};

let countryNameMapping = {
    'United States': 'United States of America',
    'United States of America': 'United States',
    'USA': 'United States',
    'UK': 'United Kingdom',
    'Great Britain': 'United Kingdom',
    'Russia': 'Russian Federation',
    'South Korea': 'Republic of Korea',
    'North Korea': 'Democratic People\'s Republic of Korea',
    'DR Congo': 'Democratic Republic of the Congo',
    'Congo': 'Republic of the Congo',
    'Czech Republic': 'Czechia',
    'Macedonia': 'North Macedonia',
    'Swaziland': 'Eswatini',
    'Burma': 'Myanmar'
};

console.log('map-game.js loaded');

async function initGame() {
    try {
        console.log('initGame started');
        if (currentGameMode === 'us-states') {
            await loadUSStates();
        } else {
            const response = await fetch('https://restcountries.com/v3.1/all');
            countries = await response.json();
            filterCountriesByGameMode();
        }
        
        console.log('Data loaded:', countries.length);
        initMap();
        loadQuestion();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

async function loadUSStates() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json');
        const data = await response.json();
        countries = data.features.map(feature => ({
            name: {
                common: feature.properties.name
            },
            isState: true
        }));
    } catch (error) {
        console.error('Error loading US states:', error);
    }
}

function filterCountriesByGameMode() {
    switch(currentGameMode) {
        case 'europe':
            countries = countries.filter(country => country.region === 'Europe');
            break;
        case 'africa':
            countries = countries.filter(country => country.region === 'Africa');
            break;
        case 'asia':
            countries = countries.filter(country => country.region === 'Asia');
            break;
        case 'americas':
            countries = countries.filter(country => country.region === 'Americas');
            break;
        case 'us-states':
            // Special data loading for US states
            break;
    }
}

function initMap() {
    console.log('initMap started');
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) {
        console.error('map-container element not found!');
        return;
    }

    const mapSettings = {
        world: { center: { lat: 30, lng: 0 }, zoom: 2 },
        europe: { center: { lat: 55, lng: 15 }, zoom: 4 },
        africa: { center: { lat: 0, lng: 20 }, zoom: 3 },
        asia: { center: { lat: 35, lng: 100 }, zoom: 3 },
        americas: { center: { lat: 0, lng: -90 }, zoom: 3 },
        'us-states': { center: { lat: 39.8283, lng: -98.5795 }, zoom: 4 }
    };

    const settings = mapSettings[currentGameMode] || mapSettings.world;

    map = new google.maps.Map(mapContainer, {
        zoom: settings.zoom,
        center: settings.center,
        minZoom: 2,
        maxZoom: 12,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeId: 'terrain',
        gestureHandling: 'cooperative',
        draggable: true,
        scrollwheel: true,
        zoomControl: true,
        disableDoubleClickZoom: false,
        keyboardShortcuts: false,
        styles: [
            {
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            },
            {
                featureType: 'administrative.country',
                elementType: 'geometry.stroke',
                stylers: [{ visibility: 'on' }, { weight: 1 }]
            },
            {
                featureType: 'administrative.country',
                elementType: 'geometry.fill',
                stylers: [{ visibility: 'on' }]
            },
            {
                featureType: 'water',
                elementType: 'geometry.fill',
                stylers: [{ color: '#a1c4fd' }]
            },
            {
                featureType: 'landscape',
                elementType: 'geometry.fill',
                stylers: [{ color: '#e9f5db' }]
            }
        ]
    });

    map.setOptions({
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true
    });

    const geoJsonUrl = currentGameMode === 'us-states' 
        ? 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json'
        : 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

    console.log('Loading GeoJSON:', geoJsonUrl);

    map.data.loadGeoJson(geoJsonUrl, null, function(features) {
        console.log('GeoJSON loaded, feature count:', features.length);
        
        // Style settings
        map.data.setStyle(function(feature) {
            let isClickable = true;
            let fillColor = '#2196F3';
            let fillOpacity = 0.1;

            if (currentGameMode !== 'world' && currentGameMode !== 'us-states') {
                const featureName = feature.getProperty('ADMIN');
                const normalizedFeatureName = normalizeCountryName(featureName);
                const normalizedCurrentCountry = currentCountry ? normalizeCountryName(currentCountry.name.common) : null;
                
                // If this feature is the currently asked country, it should be clickable
                if (normalizedFeatureName === normalizedCurrentCountry) {
                    isClickable = true;
                    fillColor = '#2196F3';
                    fillOpacity = 0.1;
                } else {
                    // If not, check the region
                    const isInRegion = countries.some(c => {
                        const normalizedCountry = normalizeCountryName(c.name.common);
                        return normalizedFeatureName === normalizedCountry;
                    });
                    
                    if (!isInRegion) {
                        fillColor = '#CCCCCC';
                        fillOpacity = 0.05;
                        isClickable = false;
                    }
                }
            }

            return {
                fillColor: fillColor,
                fillOpacity: fillOpacity,
                strokeWeight: 1,
                strokeColor: '#000',
                clickable: isClickable
            };
        });

        // Click event
        map.data.addListener('click', function(event) {
            let clickedName;
            if (currentGameMode === 'us-states') {
                clickedName = event.feature.getProperty('name');
            } else {
                clickedName = event.feature.getProperty('ADMIN');
            }
            
            if (currentGameMode !== 'world' && currentGameMode !== 'us-states') {
                const featureName = event.feature.getProperty('ADMIN');
                const normalizedFeatureName = normalizeCountryName(featureName);
                const normalizedCurrentCountry = currentCountry ? normalizeCountryName(currentCountry.name.common) : null;
                
                // If the clicked country is not the currently asked country, check the region
                if (normalizedFeatureName !== normalizedCurrentCountry) {
                    const isInRegion = countries.some(c => {
                        const normalizedCountry = normalizeCountryName(c.name.common);
                        return normalizedFeatureName === normalizedCountry;
                    });
                    if (!isInRegion) return;
                }
            }
            
            console.log('Clicked:', clickedName);
            checkAnswer(clickedName);
        });

        // Mouse hover effect
        map.data.addListener('mouseover', function(event) {
            if (currentGameMode !== 'world' && currentGameMode !== 'us-states') {
                const featureName = event.feature.getProperty('ADMIN');
                const normalizedFeatureName = normalizeCountryName(featureName);
                const normalizedCurrentCountry = currentCountry ? normalizeCountryName(currentCountry.name.common) : null;
                
                // If the hovered country is not the currently asked country, check the region
                if (normalizedFeatureName !== normalizedCurrentCountry) {
                    const isInRegion = countries.some(c => {
                        const normalizedCountry = normalizeCountryName(c.name.common);
                        return normalizedFeatureName === normalizedCountry;
                    });
                    if (!isInRegion) return;
                }
            }
            
            map.data.overrideStyle(event.feature, {
                fillOpacity: 0.3
            });
        });

        map.data.addListener('mouseout', function(event) {
            map.data.revertStyle();
        });
    });
}

function loadQuestion() {
    if (currentQuestion > 10) {
        endGame();
        return;
    }

    document.getElementById('current-question').textContent = currentQuestion;
    currentCountry = getRandomCountry();
    document.getElementById('country-name').textContent = currentCountry.name.common;
}

function getRandomCountry() {
    const randomIndex = Math.floor(Math.random() * countries.length);
    return countries[randomIndex];
}

function normalizeCountryName(name) {
    if (!name) return '';
    name = name.trim();
    return countryNameMapping[name] || name;
}

function checkAnswer(clickedName) {
    const normalizedClickedName = normalizeCountryName(clickedName);
    const normalizedCurrentCountry = normalizeCountryName(currentCountry.name.common);
    
    console.log('Checking answer:', {
        clicked: normalizedClickedName,
        correct: normalizedCurrentCountry
    });

    if (normalizedClickedName === normalizedCurrentCountry) {
        score++;
        document.getElementById('total-score').textContent = score;
        
        // Highlight correct answer
        map.data.forEach(function(feature) {
            const featureName = currentGameMode === 'us-states' 
                ? feature.getProperty('name')
                : feature.getProperty('ADMIN');
            
            if (normalizeCountryName(featureName) === normalizedCurrentCountry) {
                map.data.overrideStyle(feature, {
                    fillColor: '#4CAF50',
                    fillOpacity: 0.5
                });
            }
        });
    } else {
        // Highlight wrong answer
        map.data.forEach(function(feature) {
            const featureName = currentGameMode === 'us-states' 
                ? feature.getProperty('name')
                : feature.getProperty('ADMIN');
            
            if (normalizeCountryName(featureName) === normalizedClickedName) {
                map.data.overrideStyle(feature, {
                    fillColor: '#F44336',
                    fillOpacity: 0.5
                });
            }
            if (normalizeCountryName(featureName) === normalizedCurrentCountry) {
                map.data.overrideStyle(feature, {
                    fillColor: '#4CAF50',
                    fillOpacity: 0.5
                });
            }
        });
    }

    currentQuestion++;
    setTimeout(() => {
        map.data.revertStyle();
        loadQuestion();
    }, 1500);
}

function endGame() {
    const resultPanel = document.getElementById('game-result');
    resultPanel.style.display = 'block';
    document.getElementById('final-score').textContent = `${score}/10`;
}

document.getElementById('play-again').addEventListener('click', () => {
    currentQuestion = 1;
    score = 0;
    document.getElementById('total-score').textContent = '0';
    document.getElementById('game-result').style.display = 'none';
    initGame();
});

function changeGameMode(mode) {
    currentGameMode = mode;
    currentQuestion = 1;
    score = 0;
    document.getElementById('total-score').textContent = '0';
    document.getElementById('game-result').style.display = 'none';
    
    // Update active button
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(mode)) {
            btn.classList.add('active');
        }
    });
    
    initGame();
}

// Start the game
initGame(); 