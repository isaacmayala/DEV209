// Game state variables
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 0;
let moves = 0;
let gameStarted = false;
let timer = null;
let seconds = 0;
let canFlip = true;

// DOM elements
const gameBoard = document.getElementById('game-board');
const difficultySelect = document.getElementById('difficulty');
const newGameButton = document.getElementById('new-game');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const modal = document.getElementById('game-over-modal');
const finalMovesDisplay = document.getElementById('final-moves');
const finalTimeDisplay = document.getElementById('final-time');
const playAgainButton = document.getElementById('play-again');
const settingsButton = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    setupEventListeners();
});

// Initialize the game
function initGame() {
    const difficulty = difficultySelect.value;
    const [rows, cols] = difficulty.split('x').map(Number);
    
    // Reset game state
    resetGameState();
    
    // Create cards based on difficulty
    createCards(rows, cols);
    
    // Setup the game board grid
    setupGameBoard(rows, cols);
    
    // Place the cards on the board
    renderCards();
}

// Event listeners setup
function setupEventListeners() {
    newGameButton.addEventListener('click', initGame);
    playAgainButton.addEventListener('click', () => {
        modal.style.display = 'none';
        initGame();
    });
    
    settingsButton.addEventListener('click', () => {
        settingsPanel.style.display = settingsPanel.style.display === 'none' || settingsPanel.style.display === '' ? 'block' : 'none';
    });
    
    
    cardBackColorPicker.addEventListener('change', (e) => {
        document.documentElement.style.setProperty('--card-back', e.target.value);
    });
    
    cardFrontColorPicker.addEventListener('change', (e) => {
        document.documentElement.style.setProperty('--card-front', e.target.value);
    });
}

// Reset game state
function resetGameState() {
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    totalPairs = 0;
    moves = 0;
    seconds = 0;
    gameStarted = false;
    canFlip = true;
    
    // Reset displays
    movesDisplay.textContent = moves;
    timerDisplay.textContent = '00:00';
    
    // Clear timer if it exists
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    
    // Clear the game board
    gameBoard.innerHTML = '';
}

// Create cards for the game
function createCards(rows, cols) {
    // Calculate total number of pairs needed
    totalPairs = (rows * cols) / 2;
    
    // List of sport icons to use for cards (using FontAwesome-style icons)
    const symbols = [
        '⚽', '🏀', '🏈', '⚾', '🥎', '🏐', '🏉', '🎾', '🥏', '🎱', '🏓', '🏸',
        '🏒', '🏑', '🥍', '🏏', '⛳', '🥊', '🥋', '🎽', '⛸️', '🎿', '🛷', '🥌',
        '🏄', '🚣', '🏊', '🚴', '🧗', '🤺', '⛹️', '🤸'
    ];
    
    // Create pairs of cards
    const cardSymbols = symbols.slice(0, totalPairs);
    
    // Use map to create card objects (functional programming concept)
    cards = [...cardSymbols, ...cardSymbols]
        .map((symbol, index) => ({
            id: index,
            symbol,
            isFlipped: false,
            isMatched: false
        }));
    
    // Shuffle the cards using the Fisher-Yates algorithm
    shuffleCards(cards);
}

// Shuffle the cards
function shuffleCards(cardsArray) {
    for (let i = cardsArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardsArray[i], cardsArray[j]] = [cardsArray[j], cardsArray[i]]; // ES6 destructuring
    }
}

// Setup game board grid
function setupGameBoard(rows, cols) {
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
}

// Render cards on the board
function renderCards() {
    gameBoard.innerHTML = '';
    
    // Create DOM elements for each card
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.id = card.id;
        
        // Create front and back of card
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.innerHTML = `<span style="font-size: 2rem;">${card.symbol}</span>`;
        
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        
        // Append front and back to card
        cardElement.appendChild(cardFront);
        cardElement.appendChild(cardBack);
        
        // Add click event listener to card
        cardElement.addEventListener('click', () => handleCardClick(card.id));
        
        // Add card to game board
        gameBoard.appendChild(cardElement);
    });
}

// Handle card click
function handleCardClick(cardId) {
    // Find the card in our cards array
    const card = cards.find(c => c.id === cardId);
    const cardElement = document.querySelector(`.card[data-id="${cardId}"]`);
    
    // Check if we can flip this card
    if (!canFlip || card.isFlipped || card.isMatched) {
        return;
    }
    
    // Start the game and timer on first card flip
    if (!gameStarted) {
        startGame();
    }
    
    // Flip the card
    flipCard(card, cardElement);
    
    // Add card to flipped cards array
    flippedCards.push({ card, element: cardElement });
    
    // Check if we have flipped two cards
    if (flippedCards.length === 2) {
        // Increment moves
        moves++;
        movesDisplay.textContent = moves;
        
        // Check for a match
        setTimeout(() => checkForMatch(), 500);
    }
}

// Start the game
function startGame() {
    gameStarted = true;
    timer = setInterval(updateTimer, 1000);
}

// Flip a card
function flipCard(card, element) {
    card.isFlipped = true;
    element.classList.add('flipped');
}

// Unflip a card
function unflipCard(card, element) {
    card.isFlipped = false;
    element.classList.remove('flipped');
}

// Check for a match between flipped cards
function checkForMatch() {
    const [firstCard, secondCard] = flippedCards;
    
    if (firstCard.card.symbol === secondCard.card.symbol) {
        // We have a match
        handleMatch(firstCard, secondCard);
    } else {
        // No match
        handleMismatch(firstCard, secondCard);
    }
    
    // Clear flipped cards array
    flippedCards = [];
    
    // Check if game is over
    if (matchedPairs === totalPairs) {
        endGame();
    }
}

// Handle a match
function handleMatch(firstCard, secondCard) {
    // Mark cards as matched
    firstCard.card.isMatched = true;
    secondCard.card.isMatched = true;
    
    // Update UI
    firstCard.element.classList.add('matched');
    secondCard.element.classList.add('matched');
    
    // Increment matched pairs counter
    matchedPairs++;
}

// Handle a mismatch
function handleMismatch(firstCard, secondCard) {
    // Temporarily prevent further card flips
    canFlip = false;
    
    // Unflip the cards after a delay
    setTimeout(() => {
        unflipCard(firstCard.card, firstCard.element);
        unflipCard(secondCard.card, secondCard.element);
        canFlip = true;
    }, 1000);
}

// Update the timer
function updateTimer() {
    seconds++;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    // Format time as MM:SS
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// End the game
function endGame() {
    // Stop the timer
    clearInterval(timer);

    // Show game over modal
    finalMovesDisplay.textContent = moves;
    finalTimeDisplay.textContent = timerDisplay.textContent;
    
    // Display the modal after a short delay
    setTimeout(() => {
        modal.style.display = 'flex';
    }, 500);
}
