# World Guess Game

## Description

World Guess is an interactive geographic guessing game using Google Maps and Street View APIs. Players are placed at random locations and must try to guess their location using Street View. Guesses are made by clicking on the map, and points are awarded based on the proximity to the actual location.

## Features

- **Google Street View Integration**: Players can navigate through real-world imagery
- **Interactive Map**: Make guesses by clicking on the map
- **Visual Results**: After each guess, see the actual location, your guess, and the distance between them
- **Scoring System**: Distance-based scoring (maximum 1000 points)
- **5-Round Game**: Each game consists of 5 rounds

## Setup

1. Clone the project:
   ```bash
   git clone [repo-url]
   ```

2. Get a Google Maps API key:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable Maps JavaScript API and Street View API
   - Create an API key

3. Add your API key:
   - Replace `YOUR_API_KEY` in `index.html` with your actual API key:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>
   ```

4. Run using a web server:
   ```bash
   npx http-server
   ```
   or any other static file server.

5. Open your browser and navigate to `http://localhost:8080`

## How to Play

1. When the game starts, you'll be placed at a random Street View location
2. Explore the surroundings using Street View
3. When you think you know where you are, click that location on the map
4. Click "Submit Guess" to see your results
5. View the results and proceed to the next round
6. After 5 rounds, see your total score

## Scoring

- Maximum 1000 points per round
- Points are calculated based on the distance between your guess and the actual location
- The further away your guess, the lower your score
- Minimum score is 0 points

## Technical Details

- Built with HTML5, CSS3, and JavaScript
- Google Maps JavaScript API and Street View API integration
- Haversine formula for distance calculation
- Responsive design

## Future Enhancements

- Difficulty levels
- Multiplayer support
- Global leaderboard
- Custom location sets
- Time limit option 