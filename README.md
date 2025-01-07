# World Guess Game PRO 🌍

A fun and educational web-based geography game collection featuring three different game modes: Street View Guessing, Flag Guessing, and Country Finding.

## 🎮 Game Modes

### 1. Street View Guessing Game
- Get dropped in a random location using Google Street View
- Look around and explore the environment
- Make your guess by clicking on the world map
- Score points based on how close your guess is to the actual location
- Play 5 rounds and try to achieve the highest score

### 2. Flag Guessing Game
- Test your knowledge of world flags
- Choose from 4 options for each flag shown
- Complete 10 rounds
- Instant feedback on correct and incorrect answers
- Track your score as you play

### 3. Country Finding Game
- Multiple region options:
  - World
  - Europe
  - Africa
  - Asia
  - Americas
  - US States
- Find the requested country/state on the map
- 10 rounds per game
- Visual feedback for correct and incorrect answers

## 🚀 Features

- Responsive design
- Interactive maps using Google Maps API
- Real-time scoring system
- Beautiful UI with smooth animations
- Easy navigation between games
- Help modal with game instructions
- Support for both satellite and roadmap views
- Mobile-friendly interface

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Google Maps API
- Google Street View API
- REST Countries API
- Font Awesome Icons

## 🎯 Scoring System

### Street View Game
- Distance < 10km: 5000 points
- Distance < 50km: 4000 points
- Distance < 100km: 3000 points
- Distance < 500km: 2000 points
- Distance < 1000km: 1000 points
- Distance < 2000km: 500 points
- Distance > 2000km: 0 points

### Flag & Country Finding Games
- 1 point per correct answer
- Final score displayed as X/10

## 🔧 Installation & Setup

1. Clone the repository:
```bash
git clone https://github.com/semihasdan/WorldGuessGamePRO.git
```

2. Navigate to the project directory:
```bash
cd WorldGuessGamePRO
```

3. Create a `.env` file and add your Google Maps API key:
```
GOOGLE_MAPS_API_KEY=your_api_key_here
```

4. Open `index.html` in your web browser or use a local server.

## 📝 API Requirements

- Google Maps API key with the following APIs enabled:
  - Maps JavaScript API
  - Street View API
  - Geocoding API

## 🌟 Future Improvements

- Add more game modes
- Implement user accounts and high scores
- Add multiplayer support
- Include difficulty levels
- Add more detailed statistics
- Implement a practice mode
- Add sound effects and background music

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Semih AŞDAN - [GitHub Profile](https://github.com/semihasdan)

## 🙏 Acknowledgments

- [Google Maps Platform](https://developers.google.com/maps) for their excellent mapping services
- [REST Countries API](https://restcountries.com/) for providing country data
- [Font Awesome](https://fontawesome.com/) for the beautiful icons
