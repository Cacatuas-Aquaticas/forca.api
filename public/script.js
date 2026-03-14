const API_BASE = '/api';

const elements = {
    wordDisplay: document.getElementById('word-display'),
    keyboard: document.getElementById('keyboard'),
    statusMessage: document.getElementById('status-message'),
    btnRestart: document.getElementById('btn-restart'),
    loading: document.getElementById('loading'),
    btnRandomMode: document.getElementById('btn-random-word'),
    btnDailyMode: document.getElementById('btn-daily-word'),
    bodyParts: [
        document.getElementById('part-head'),
        document.getElementById('part-body'),
        document.getElementById('part-arm-l'),
        document.getElementById('part-arm-r'),
        document.getElementById('part-leg-l'),
        document.getElementById('part-leg-r')
    ]
};

let currentWord = '';
let guessedLetters = new Set();
let wrongGuesses = 0;
const maxWrongGuesses = 6;
let gameMode = 'random'; // 'random' or 'daily'

// Initialize game on load
init();

function init() {
    setupKeyboard();
    setupEventListeners();
    startNewGame();
}

function setupEventListeners() {
    elements.btnRestart.addEventListener('click', startNewGame);
    
    elements.btnRandomMode.addEventListener('click', () => {
        if (gameMode !== 'random') {
            gameMode = 'random';
            updateModeUI();
            startNewGame();
        }
    });

    elements.btnDailyMode.addEventListener('click', () => {
        if (gameMode !== 'daily') {
            gameMode = 'daily';
            updateModeUI();
            startNewGame();
        }
    });

    // Physical keyboard support
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (/^[a-zç]$/i.test(key) && !elements.loading.classList.contains('hidden')) {
            // Not loading, handle key
            handleGuess(key);
        } else if (e.key === 'Enter' && !elements.btnRestart.classList.contains('hidden')) {
            startNewGame();
        }
    });
}

function updateModeUI() {
    if (gameMode === 'random') {
        elements.btnRandomMode.classList.add('active');
        elements.btnDailyMode.classList.remove('active');
    } else {
        elements.btnRandomMode.classList.remove('active');
        elements.btnDailyMode.classList.add('active');
    }
}

function setupKeyboard() {
    const layout = [
        'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
        'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç',
        'z', 'x', 'c', 'v', 'b', 'n', 'm'
    ];

    elements.keyboard.innerHTML = '';
    
    layout.forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'key';
        btn.textContent = key;
        btn.dataset.key = key;
        btn.addEventListener('click', () => handleGuess(key));
        elements.keyboard.appendChild(btn);
    });
}

async function startNewGame() {
    resetGameState();
    elements.loading.classList.remove('hidden');

    try {
        let endpoint = `${API_BASE}/word`; // Random word
        
        if (gameMode === 'daily') {
            const today = new Date().toISOString().split('T')[0];
            endpoint = `${API_BASE}/game/${today}`;
        }

        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error('Falha ao obter nova palavra');
        }

        const data = await response.json();
        
        if (data.word) {
            currentWord = normalizeWord(data.word);
            renderWordDisplay();
        } else {
            showStatus('Nenhuma palavra disponível!', 'lose');
        }

    } catch (error) {
        console.error('Erro:', error);
        showStatus('Erro de conexão. Tente novamente.', 'lose');
    } finally {
        elements.loading.classList.add('hidden');
    }
}

function resetGameState() {
    currentWord = '';
    guessedLetters.clear();
    wrongGuesses = 0;
    
    // Reset UI
    elements.statusMessage.textContent = '';
    elements.statusMessage.className = 'status-message';
    elements.btnRestart.classList.add('hidden');
    
    // Reset Hangman SVG
    elements.bodyParts.forEach(part => {
        if(part) part.classList.remove('visible');
    });

    // Reset Keys
    document.querySelectorAll('.key').forEach(btn => {
        btn.disabled = false;
        btn.className = 'key';
    });
}

function normalizeWord(word) {
    // Remove indesejados mas mantém letras e espaços (simples)
    // Para simplificar, transformamos a palavra em minúsculas
    return word.toLowerCase().trim();
}

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function renderWordDisplay() {
    elements.wordDisplay.innerHTML = '';
    
    for (let i = 0; i < currentWord.length; i++) {
        const originalChar = currentWord[i];
        
        if (originalChar === ' ' || originalChar === '-') {
            // Space or hyphen
            const box = document.createElement('div');
            box.className = 'letter-box empty';
            box.textContent = originalChar;
            elements.wordDisplay.appendChild(box);
            continue;
        }

        const normalizedChar = removeAccents(originalChar);
        const box = document.createElement('div');
        box.className = 'letter-box';
        
        if (guessedLetters.has(normalizedChar)) {
            box.textContent = originalChar;
        }
        
        elements.wordDisplay.appendChild(box);
    }
}

function handleGuess(key) {
    // Prevent actions if game is over or loading
    if (wrongGuesses >= maxWrongGuesses || isGameWon() || elements.loading.classList.contains('hidden') === false) {
        return;
    }

    if (guessedLetters.has(key)) return;

    guessedLetters.add(key);

    const btn = document.querySelector(`.key[data-key="${key}"]`);
    if (btn) btn.disabled = true;

    const normalizedWord = removeAccents(currentWord);

    if (normalizedWord.includes(key)) {
        if (btn) btn.classList.add('correct');
        renderWordDisplay();
        checkWinCondition();
    } else {
        if (btn) btn.classList.add('wrong');
        handleWrongGuess();
    }
}

function handleWrongGuess() {
    if (wrongGuesses < maxWrongGuesses) {
        if(elements.bodyParts[wrongGuesses]) {
           elements.bodyParts[wrongGuesses].classList.add('visible');
        }
        wrongGuesses++;
    }

    if (wrongGuesses >= maxWrongGuesses) {
        endGame(false);
    }
}

function isGameWon() {
    if(!currentWord) return false;
    const normalizedStr = removeAccents(currentWord);
    
    for (let i = 0; i < normalizedStr.length; i++) {
        const char = normalizedStr[i];
        if (char !== ' ' && char !== '-' && !guessedLetters.has(char)) {
            return false;
        }
    }
    return true;
}

function checkWinCondition() {
    if (isGameWon()) {
        endGame(true);
    }
}

function endGame(won) {
    if (won) {
        showStatus('VOCÊ VENCEU! 🎉', 'win');
    } else {
        showStatus(`GAME OVER. A palavra era: ${currentWord.toUpperCase()}`, 'lose');
        // Show missed letters
        const normStr = removeAccents(currentWord);
        for(let i=0; i<normStr.length;i++){
             if(normStr[i] !== ' ' && normStr[i] !== '-'){
                 guessedLetters.add(normStr[i]);
             }
        }
        renderWordDisplay();
    }
    
    // Disable remaining keys
    document.querySelectorAll('.key').forEach(btn => {
        btn.disabled = true;
    });
    
    elements.btnRestart.classList.remove('hidden');
}

function showStatus(message, type) {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message ${type}`;
}
