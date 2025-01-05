# World Guess Game

## Description

World Guess is an interactive geographic guessing game using Google Maps and Street View APIs. Players are placed at random locations and must try to guess their location using Street View. Guesses are made by clicking on the map, and points are awarded based on the proximity to the actual location.

## Features

- **Google Street View Integration**: Players can navigate through real-world imagery
- **Interactive Map**: Make guesses by clicking on the map
- **Visual Results**: After each guess, see the actual location, your guess, and the distance between them
- **Scoring System**: Distance-based scoring (maximum 1000 points)
- **5-Round Game**: Each game consists of 5 rounds

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- A Google Cloud Platform account
- Google Maps API key

## Getting Started

### 1. Clone the project:
```bash
git clone https://github.com/semihasdan/WorldGuessGame.git
cd WorldGuessGame
```

### 2. Install Dependencies:
```bash
npm install
```

### 3. Get a Google Maps API Key:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the following APIs in "APIs & Services > Library":
   - Maps JavaScript API
   - Street View API
4. Create credentials:
   - Go to "APIs & Services > Credentials"
   - Click "Create Credentials" > "API Key"
   - Your new API key will be displayed
5. (Recommended) Restrict the API key:
   - In the credentials page, click on the newly created API key
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain (e.g., localhost for development)
   - Under "API restrictions", select "Restrict key"
   - Select the APIs you enabled (Maps JavaScript API and Street View API)
   - Click "Save"

### 4. Configure Environment Variables:

1. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

2. Add your Google Maps API key to the `.env` file:
```
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 5. Run the Application:

1. Start the development server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

## How to Play

1. When the game starts, you'll be placed at a random Street View location
2. Explore the surroundings using Street View
3. When you think you know where you are, click that location on the map
4. Click "Submit Guess" to see your results
5. View the results and proceed to the next round
6. After 5 rounds, see your total score

## Scoring System

- Maximum 1000 points per round
- Points are calculated based on the distance between your guess and the actual location
- The closer your guess, the higher your score:
  - Within 1 km: 1000 points
  - Within 5 km: 800-999 points
  - Within 10 km: 600-799 points
  - Within 50 km: 400-599 points
  - Within 100 km: 200-399 points
  - Within 500 km: 100-199 points
  - Within 1000 km: 1-99 points
  - Over 1000 km: 0 points

## Technical Details

- Built with HTML5, CSS3, and JavaScript
- Google Maps JavaScript API and Street View API integration
- Haversine formula for distance calculation
- Responsive design for desktop and mobile devices

## Future Enhancements

- Difficulty levels (Easy, Medium, Hard)
- Multiplayer support
- Global leaderboard
- Custom location sets
- Time limit option
- Achievement system

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

![image](https://github.com/user-attachments/assets/792ddd44-9ade-4712-894e-392701b9b2b3)
