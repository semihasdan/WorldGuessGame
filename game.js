class WorldGuessGame {
    constructor() {
        this.totalRounds = 5;
        this.currentRound = 1;
        this.totalScore = 0;
        this.currentLocation = null;
        this.guessMarker = null;
        this.streetView = null;
        this.guessMap = null;
        this.streetViewService = new google.maps.StreetViewService();
        
        this.initializeMaps();
        this.setupEventListeners();
    }

    initializeMaps() {
        // Initialize Street View
        const streetViewDiv = document.getElementById('street-view');
        this.streetView = new google.maps.StreetViewPanorama(streetViewDiv, {
            addressControl: false,
            showRoadLabels: false,
            zoomControl: false,
            motionTracking: false,
            motionTrackingControl: false,
            fullscreenControl: false
        });

        // Initialize guess map
        const guessMapDiv = document.getElementById('guess-map');
        this.guessMap = new google.maps.Map(guessMapDiv, {
            zoom: 2,
            center: { lat: 0, lng: 0 },
            streetViewControl: false
        });

        // Add click event to the map
        this.guessMap.addListener('click', (e) => {
            this.placeGuessMarker(e.latLng);
        });

        this.startNewRound();
    }

    setupEventListeners() {
        document.getElementById('make-guess').addEventListener('click', () => this.submitGuess());
        document.getElementById('next-round').addEventListener('click', () => this.startNewRound());
        document.getElementById('play-again').addEventListener('click', () => this.resetGame());
    }

    // Generate random location
    async generateRandomLocation() {
        const regions = [
            { minLat: 35, maxLat: 60, minLng: -10, maxLng: 30 },    // Europe
            { minLat: 25, maxLat: 50, minLng: -130, maxLng: -70 },  // North America
            { minLat: -40, maxLat: 5, minLng: -75, maxLng: -35 },   // South America
            { minLat: 20, maxLat: 45, minLng: 110, maxLng: 145 },   // Japan and Surroundings
            { minLat: -45, maxLat: -10, minLng: 110, maxLng: 155 }, // Australia
            { minLat: 35, maxLat: 60, minLng: 30, maxLng: 180 }     // Asia
        ];

        const getRandomInRange = (min, max) => {
            return Math.random() * (max - min) + min;
        };

        const findStreetView = async (maxAttempts = 10) => {
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                // Select a random region
                const region = regions[Math.floor(Math.random() * regions.length)];
                
                // Select a random point within the region
                const lat = getRandomInRange(region.minLat, region.maxLat);
                const lng = getRandomInRange(region.minLng, region.maxLng);
                
                try {
                    // Check if there is Street View at this point
                    const result = await new Promise((resolve, reject) => {
                        this.streetViewService.getPanorama({
                            location: { lat, lng },
                            radius: 50000, // Search within a 50km radius
                            source: google.maps.StreetViewSource.OUTDOOR
                        }, (data, status) => {
                            if (status === 'OK') {
                                resolve(data.location.latLng);
                            } else {
                                reject(status);
                            }
                        });
                    });
                    
                    // A suitable location was found
                    return {
                        lat: result.lat(),
                        lng: result.lng()
                    };
                } catch (error) {
                    console.log('Location not found, retrying...');
                    continue;
                }
            }
            
            // Return a default location if no suitable location is found
            console.log('No suitable location found, using default location...');
            return { lat: 48.8584, lng: 2.2945 }; // Paris
        };

        return await findStreetView();
    }

    async startNewRound() {
        // Generate new location
        this.currentLocation = await this.generateRandomLocation();
        
        // Update Street View
        this.streetView.setPosition(this.currentLocation);

        // Reset the map
        if (this.guessMarker) {
            this.guessMarker.setMap(null);
        }
        this.guessMap.setCenter({ lat: 0, lng: 0 });
        this.guessMap.setZoom(2);

        // Update UI
        document.getElementById('current-round').textContent = this.currentRound;
        document.getElementById('round-result').style.display = 'none';
        document.getElementById('make-guess').style.display = 'block';
        document.getElementById('next-round').style.display = 'none';

        // Clear previous result markers if any
        if (this.resultMarker) {
            this.resultMarker.setMap(null);
            this.resultLine.setMap(null);
        }
    }

    placeGuessMarker(location) {
        if (this.guessMarker) {
            this.guessMarker.setMap(null);
        }
        this.guessMarker = new google.maps.Marker({
            position: location,
            map: this.guessMap,
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    toRad(degree) {
        return degree * Math.PI / 180;
    }

    calculateScore(distance) {
        const maxScore = 1000;
        const score = Math.max(0, maxScore - distance);
        return Math.round(score);
    }

    showResult(guessLocation) {
        const distance = this.calculateDistance(
            this.currentLocation.lat,
            this.currentLocation.lng,
            guessLocation.lat(),
            guessLocation.lng()
        );

        const score = this.calculateScore(distance);
        this.totalScore += score;

        // Gerçek konumu göster
        this.resultMarker = new google.maps.Marker({
            position: this.currentLocation,
            map: this.guessMap,
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        });

        // Çizgi çiz
        this.resultLine = new google.maps.Polyline({
            path: [this.currentLocation, guessLocation.toJSON()],
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2,
            map: this.guessMap
        });

        // Haritayı her iki noktayı gösterecek şekilde ayarla
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(this.currentLocation);
        bounds.extend(guessLocation.toJSON());
        this.guessMap.fitBounds(bounds);

        // UI'ı güncelle
        document.getElementById('distance').textContent = distance.toFixed(2);
        document.getElementById('round-score').textContent = score;
        document.getElementById('total-score').textContent = this.totalScore;
        document.getElementById('round-result').style.display = 'block';
        document.getElementById('make-guess').style.display = 'none';

        if (this.currentRound < this.totalRounds) {
            document.getElementById('next-round').style.display = 'block';
        } else {
            this.endGame();
        }
    }

    submitGuess() {
        if (!this.guessMarker) {
            alert('Lütfen haritada bir konum seçin!');
            return;
        }
        this.showResult(this.guessMarker.getPosition());
        this.currentRound++;
    }

    endGame() {
        document.getElementById('final-score').textContent = this.totalScore;
        document.getElementById('game-over').style.display = 'block';
    }

    resetGame() {
        this.currentRound = 1;
        this.totalScore = 0;
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('total-score').textContent = '0';
        this.startNewRound();
    }
}

// Start the game
window.onload = () => {
    new WorldGuessGame();
}; 