let map, panorama, marker;
let currentRound = 1;
let totalScore = 0;
let isGuessPlaced = false;
let resultMarkers = [];
let resultPolyline = null;

// Map initial settings
const mapOptions = {
    center: { lat: 0, lng: 0 },
    zoom: 2,
    streetViewControl: false,
    fullscreenControl: false,
    tileSize: new google.maps.Size(256, 256),
    maxZoom: 21,
    gestureHandling: 'greedy',
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
        }
    ]
};

// Generate random location
function getRandomLocation() {
    // Adjust latitude and longitude for more chances in terrestrial areas
    const lat = (Math.random() * 140 - 70); // -70 to 70 (exclude poles)
    const lng = Math.random() * 360 - 180;   // -180 to 180
    return { lat, lng };
}

async function checkStreetViewAvailability(location) {
    return new Promise((resolve) => {
        const sv = new google.maps.StreetViewService();
        // Increase search radius to 100 km
        sv.getPanorama({ 
            location: location, 
            radius: 100000, // 100 km radius
            source: google.maps.StreetViewSource.OUTDOOR // Only outdoor views
        }, (data, status) => {
            if (status === 'OK') {
                // If panorama is found, return the exact location
                resolve({ 
                    isValid: true, 
                    location: data.location.latLng
                });
            } else {
                resolve({ 
                    isValid: false, 
                    location: null 
                });
            }
        });
    });
}

async function getValidStreetViewLocation() {
    let result;
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
        const randomLoc = getRandomLocation();
        result = await checkStreetViewAvailability(randomLoc);
        
        if (result.isValid) {
            return result.location;
        }
        attempts++;
    }

    // If no valid location is found, randomly select from known locations
    const fallbackLocations = [
        { lat: 40.7128, lng: -74.0060 }, // New York
        { lat: 48.8566, lng: 2.3522 },   // Paris
        { lat: 35.6762, lng: 139.6503 }, // Tokyo
        { lat: 51.5074, lng: -0.1278 }   // London
    ];
    
    return fallbackLocations[Math.floor(Math.random() * fallbackLocations.length)];
}

function initGame() {
    if (typeof google === 'undefined') {
        console.error('Google Maps not loaded');
        return;
    }

    try {
        console.log('Initializing game...');
        
        // Create map
        const mapElement = document.getElementById('guess-map');
        if (!mapElement) {
            throw new Error('Map container not found!');
        }

        // Initialize the map
        map = new google.maps.Map(mapElement, mapOptions);
        
        // Wait for the map to be fully loaded
        google.maps.event.addListenerOnce(map, 'idle', async () => {
            console.log('Map loaded, starting game...');
            
            try {
                // Start Street View
                await startNewRound();

                // Map click event
                map.addListener('click', function(e) {
                    placeMarker(e.latLng);
                    isGuessPlaced = true;
                });

                // UI events
                document.getElementById('make-guess').addEventListener('click', submitGuess);
                document.getElementById('next-round').addEventListener('click', startNewRound);
                document.getElementById('play-again').addEventListener('click', resetGame);
                document.getElementById('toggle-map').addEventListener('click', toggleMapType);
                document.getElementById('help').addEventListener('click', showHelp);
                document.querySelector('.close-modal').addEventListener('click', hideHelp);

                document.querySelector('.overlay').addEventListener('click', function() {
                    document.getElementById('round-result').style.display = 'none';
                    document.querySelector('.overlay').style.display = 'none';
                });

                console.log('Game initialized successfully');
            } catch (error) {
                console.error('Error during game setup:', error);
                alert('Error setting up the game. Please refresh and try again.');
            }
        });
    } catch (error) {
        console.error('Error initializing game:', error);
        alert('Error initializing game. Please refresh the page and try again.');
    }
}

async function startNewRound() {
    try {
        // Reset UI
        document.getElementById('make-guess').style.display = 'block';
        document.getElementById('next-round').style.display = 'none';
        document.getElementById('round-result').style.display = 'none';
        document.querySelector('.overlay').style.display = 'none';
        
        // Clear map
        clearMap();
        isGuessPlaced = false;

        // Select random location
        const randomLocation = await getValidStreetViewLocation();
        
        // Update Street View
        const streetViewElement = document.getElementById('street-view');
        if (!streetViewElement) {
            throw new Error('Street View container not found!');
        }

        panorama = new google.maps.StreetViewPanorama(
            streetViewElement,
            {
                position: randomLocation,
                pov: { heading: 0, pitch: 0 },
                zoom: 1,
                addressControl: false,
                showRoadLabels: false,
                motionTracking: false,
                motionTrackingControl: false,
                linksControl: true,
                panControl: true,
                enableCloseButton: false
            }
        );

        // Reset map
        map.setCenter({ lat: 0, lng: 0 });
        map.setZoom(2);

        console.log('New round started successfully');
    } catch (error) {
        console.error('Error starting new round:', error);
        alert('Error starting new round. Please try again.');
    }
}

function placeMarker(location) {
    if (marker) {
        marker.setMap(null);
    }
    marker = new google.maps.Marker({
        position: location,
        map: map,
        animation: google.maps.Animation.DROP
    });
}

function submitGuess() {
    if (!isGuessPlaced) {
        alert('Please select a location on the map!');
        return;
    }

    const actualLocation = panorama.getPosition();
    const guessLocation = marker.getPosition();
    const distance = calculateDistance(
        actualLocation.lat(),
        actualLocation.lng(),
        guessLocation.lat(),
        guessLocation.lng()
    );

    // Calculate score
    const score = calculateScore(distance);
    totalScore += score;

    // Show results
    showRoundResult(distance, score);

    // Update UI
    document.getElementById('make-guess').style.display = 'none';
    document.getElementById('total-score').textContent = totalScore;
    
    if (currentRound < 5) {
        document.getElementById('next-round').style.display = 'block';
        currentRound++;
        document.getElementById('current-round').textContent = currentRound;
    } else {
        showGameOver();
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius (km)
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
}

function toRad(value) {
    return value * Math.PI / 180;
}

function calculateScore(distance) {
    if (distance < 10) return 5000;
    if (distance < 50) return 4000;
    if (distance < 100) return 3000;
    if (distance < 500) return 2000;
    if (distance < 1000) return 1000;
    if (distance < 2000) return 500;
    return 0;
}

function clearMap() {
    // Clear all markers
    if (marker) {
        marker.setMap(null);
    }
    resultMarkers.forEach(marker => marker.setMap(null));
    resultMarkers = [];
    
    // Clear line
    if (resultPolyline) {
        resultPolyline.setMap(null);
        resultPolyline = null;
    }
}

function showRoundResult(distance, score) {
    document.getElementById('distance').textContent = distance;
    document.getElementById('round-score').textContent = score;
    document.getElementById('round-result').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';

    // Create a new map
    const resultMap = new google.maps.Map(
        document.getElementById('result-map'),
        {
            zoom: 2,
            center: { lat: 0, lng: 0 },
            streetViewControl: false,
            fullscreenControl: false
        }
    );

    const actualLocation = panorama.getPosition();
    const guessLocation = marker.getPosition();

    // Add markers for actual and guessed locations
    const actualMarker = new google.maps.Marker({
        position: actualLocation,
        map: resultMap,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#4CAF50',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF'
        }
    });

    const guessMarker = new google.maps.Marker({
        position: guessLocation,
        map: resultMap,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#F44336',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF'
        }
    });

    resultMarkers.push(actualMarker, guessMarker);

    // Draw line between points
    resultPolyline = new google.maps.Polyline({
        path: [actualLocation, guessLocation],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        map: resultMap
    });

    // Adjust map bounds to show both markers
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(actualLocation);
    bounds.extend(guessLocation);
    resultMap.fitBounds(bounds);
}

function showGameOver() {
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('final-score').textContent = totalScore;
}

function resetGame() {
    currentRound = 1;
    totalScore = 0;
    document.getElementById('current-round').textContent = currentRound;
    document.getElementById('total-score').textContent = totalScore;
    document.getElementById('game-over').style.display = 'none';
    startNewRound();
}

function toggleMapType() {
    const mapType = map.getMapTypeId();
    map.setMapTypeId(mapType === 'roadmap' ? 'satellite' : 'roadmap');
}

function showHelp() {
    document.getElementById('help-modal').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';
}

function hideHelp() {
    document.getElementById('help-modal').style.display = 'none';
    document.querySelector('.overlay').style.display = 'none';
}

// Initialize game when Google Maps API is loaded
window.initGame = initGame; 