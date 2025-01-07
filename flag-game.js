let countries = [];
let currentQuestion = 1;
let score = 0;
let currentOptions = [];
let correctAnswers = 0;

// Initialize the game
async function initGame() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        countries = await response.json();
        loadQuestion();
    } catch (error) {
        console.error('Error loading country data:', error);
    }
}

// Load new question
function loadQuestion() {
    if (currentQuestion > 10) {
        endGame();
        return;
    }

    document.getElementById('current-question').textContent = currentQuestion;
    
    // Select 4 random countries
    currentOptions = getRandomCountries(4);
    const correctCountry = currentOptions[0];

    // Shuffle options
    shuffleArray(currentOptions);

    // Show flag
    const flagImage = document.getElementById('flag-image');
    flagImage.src = correctCountry.flags.png;
    flagImage.alt = `${correctCountry.name.common} flag`;

    // Place options in buttons
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach((button, index) => {
        button.textContent = currentOptions[index].name.common;
        button.classList.remove('correct', 'incorrect');
        button.disabled = false;
        button.onclick = () => checkAnswer(currentOptions[index], correctCountry);
    });
}

// Select random countries
function getRandomCountries(count) {
    const selectedCountries = [];
    const tempCountries = [...countries];
    
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * tempCountries.length);
        selectedCountries.push(tempCountries.splice(randomIndex, 1)[0]);
    }
    
    return selectedCountries;
}

// Shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Check answer
function checkAnswer(selectedCountry, correctCountry) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(button => {
        if (button.textContent === correctCountry.name.common) {
            button.classList.add('correct');
        }
        if (button.textContent === selectedCountry.name.common && selectedCountry !== correctCountry) {
            button.classList.add('incorrect');
        }
        button.disabled = true;
    });

    if (selectedCountry === correctCountry) {
        correctAnswers++;
        score++;
        document.getElementById('total-score').textContent = score;
    }
    
    currentQuestion++;
    setTimeout(() => {
        loadQuestion();
    }, 1500);
}

// End game
function endGame() {
    const resultPanel = document.getElementById('game-result');
    resultPanel.style.display = 'block';
    document.getElementById('final-score').textContent = `${correctAnswers}/10`;
}

// Play again
document.getElementById('play-again').addEventListener('click', () => {
    currentQuestion = 1;
    score = 0;
    correctAnswers = 0;
    document.getElementById('total-score').textContent = '0';
    document.getElementById('game-result').style.display = 'none';
    initGame();
});

// Start game
initGame(); 