const cardImages = [
  { name: 1, front: "./media/1.png", back: "./media/retro.png" },
  { name: 2, front: "./media/2.png", back: "./media/retro.png" },
  { name: 3, front: "./media/3.png", back: "./media/retro.png" },
  { name: 4, front: "./media/4.png", back: "./media/retro.png" },
  { name: 5, front: "./media/5.png", back: "./media/retro.png" },
  { name: 6, front: "./media/6.png", back: "./media/retro.png" },
  { name: 7, front: "./media/7.png", back: "./media/retro.png" },
  { name: 8, front: "./media/8.png", back: "./media/retro.png" },
  { name: 9, front: "./media/9.png", back: "./media/retro.png" },
  { name: 10, front: "./media/10.png", back: "./media/retro.png" },
  { name: 11, front: "./media/11.png", back: "./media/retro.png" },
  { name: 12, front: "./media/12.png", back: "./media/retro.png" },
  { name: 13, front: "./media/13.png", back: "./media/retro.png" },
];

const gameState = {
  isFirstLaunch: !localStorage.getItem("hasLaunched"),
  isRunning: false,
  currentMode: 3,
  matchedPairs: 0,
  totalPairs: 0,
  moves: 0,
  timer: 0,
  timerInterval: null,
  flippedCards: [],
  wasPaused: false,
  pausedTime: 0,
};

document.addEventListener("DOMContentLoaded", () => {
  const modals = {
    // gameModal: new bootstrap.Modal(document.getElementById("gameModal"), {
    //   backdrop: "static",
    //   keyboard: false,
    // }),
    settingsModal: new bootstrap.Modal(document.getElementById("settingsModal"), {
      backdrop: "static",
      keyboard: false,
    }),
    historyModal: new bootstrap.Modal(document.getElementById("historyModal"), {
      backdrop: "static",
      keyboard: false,
    }),
    victoryModal: new bootstrap.Modal(document.getElementById("victoryModal"), {
      backdrop: "static",
      keyboard: false,
    }),
  };

  const elements = {
    playGameBtn: document.getElementById("playGameBtn"),
    startBtn: document.getElementById("startBtn"),
    settingsBtn: document.getElementById("settingsBtn"),
    resetBtn: document.getElementById("resetBtn"),
    saveSettingsBtn: document.getElementById("saveSettingsBtn"),
    resetSettingsBtn: document.getElementById("resetSettingsBtn"),
    newGameBtn: document.getElementById("newGameBtn"),
    victorySettingsBtn: document.getElementById("victorySettingsBtn"),
    historyBtn: document.getElementById("historyBtn"),
    gameContainer: document.getElementById("gameContainer"),
    gameBoard: document.getElementById("gameBoard"),
    gameResult: document.getElementById("gameResult"),
    historyTableBody: document.getElementById("historyTableBody"),
    gameMode: document.getElementById("gameMode"),
    timerDisplay: document.getElementById("timerDisplay"),
    // gameModal: document.getElementById("gameModal"),
    settingsModal: document.getElementById("settingsModal"),
    historyModal: document.getElementById("historyModal"),
    victoryModal: document.getElementById("victoryModal"),
  };

  function init() {
    loadSavedSettings();
    setupEventListeners();
    initializeGameBoard();
    handleFirstLaunch();
  }

  function getGameModeIcon(mode) {
    if (mode <= 3) return "emoji_events";
    if (mode <= 4) return "stars";
    return "local_fire_department";
  }

  function handleFirstLaunch() {
    if (gameState.isFirstLaunch) {
      localStorage.setItem("hasLaunched", "true");
      // modals.gameModal.show();
      setTimeout(() => {
        modals.settingsModal.show();
        document.body.classList.add("modal-open");
        // elements.gameModal.classList.add("dim-background");
      }, 150);
    }
  }

  function setupEventListeners() {
    elements.settingsModal.addEventListener("show.bs.modal", () => {
      document.body.classList.add("modal-open");
      // elements.gameModal.classList.add("dim-background");
    });

    elements.settingsModal.addEventListener("hidden.bs.modal", () => {
      document.body.classList.remove("modal-open");
      // elements.gameModal.classList.remove("dim-background");
    });

    elements.settingsBtn.addEventListener("click", () => {
      if (!gameState.isRunning) {
        modals.settingsModal.show();
      }
    });

    elements.historyBtn.addEventListener("click", () => {
      if (gameState.isRunning) {
        pauseGame();
      }
      showMatchHistory();
    });

    elements.startBtn.addEventListener("click", startGame);
    elements.resetBtn.addEventListener("click", resetGame);
    elements.saveSettingsBtn.addEventListener("click", saveSettings);
    elements.resetSettingsBtn.addEventListener("click", resetSettings);

    elements.newGameBtn.addEventListener("click", () => {
      modals.victoryModal.hide();
      resetGame();
      startGame();
    });

    elements.victorySettingsBtn.addEventListener("click", () => {
      modals.victoryModal.hide();
      modals.settingsModal.show();
    });

    document.querySelectorAll(".btn").forEach((button) => {
      button.addEventListener("click", createRipple);
    });

    document.addEventListener("keydown", handleKeyboardControls);
  }

  function showMatchHistory() {
    const history = JSON.parse(localStorage.getItem("gameHistory")) || [];
    elements.historyTableBody.innerHTML = "";

    history.forEach((game) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <span class="material-icons me-2 align-middle">${getGameModeIcon(game.mode)}</span>
          ${game.mode}x${game.mode}
        </td>
        <td><span class="badge bg-primary">${game.score}</span></td>
        <td>${formatTime(game.time)}</td>
      `;
      elements.historyTableBody.appendChild(row);
    });

    const clearButtonRow = document.createElement("tr");
    clearButtonRow.innerHTML = `
      <td colspan="3" class="text-center">
        <button id="clearHistoryBtn" class="btn btn-danger ripple-effect mt-3">
          <span class="material-icons align-middle me-2">delete</span>
          <span class="align-middle">Clear History</span>
        </button>
      </td>
    `;
    elements.historyTableBody.appendChild(clearButtonRow);

    document.getElementById("clearHistoryBtn").addEventListener("click", () => {
      localStorage.removeItem("gameHistory");
      elements.historyTableBody.innerHTML = "";
      showMatchHistory();
    });

    modals.historyModal.show();
  }

  function handleGameWin() {
    stopTimer();
    gameState.isRunning = false;

    const jsConfetti = new JSConfetti();
    jsConfetti.addConfetti({
      confettiColors: ["#FF5252", "#FF4081", "#7C4DFF", "#448AFF", "#64FFDA", "#B2FF59", "#FFAB40", "#FF6E40"],
      confettiNumber: 300,
      confettiRadius: 6,
      confettiSpeed: 2,
    });

    const score = calculateScore();
    saveGameHistory(score);

    elements.gameResult.innerHTML = `
    <div class="victory-text">
      <span class="material-icons display-1 mb-3 text-primary">emoji_events</span>
      <h2>Congratulations!</h2>
      <div class="mt-3">
        <p><span class="material-icons me-2">timer</span>Time: ${formatTime(gameState.timer)}</p>
        <p><span class="material-icons me-2">swap_horiz</span>Moves: ${gameState.moves}</p>
        <p><span class="material-icons me-2">stars</span>Score: ${score}</p>
      </div>
    </div>
  `;

    modals.victoryModal.show();
  }

  function handleKeyboardControls(event) {
    if (gameState.isRunning) {
      switch (event.key.toLowerCase()) {
        case "r":
          resetGame();
          break;
        case "p":
          gameState.isRunning ? pauseGame() : resumeGame();
          break;
      }
    }
  }

  function startGame() {
    if (!gameState.isRunning) {
      if (gameState.wasPaused) {
        resumeGame();
      } else {
        gameState.isRunning = true;
        gameState.moves = 0;
        gameState.matchedPairs = 0;
        gameState.timer = gameState.pausedTime;
        gameState.flippedCards = [];

        elements.startBtn.disabled = false;
        elements.settingsBtn.disabled = true;
        elements.startBtn.innerHTML = '<span class="material-icons align-middle me-2">pause</span><span class="align-middle">Pause</span>';

        updateTimerDisplay();
        startTimer();
        enableCards();
      }
    } else {
      pauseGame();
    }
  }

  function pauseGame() {
    if (gameState.isRunning) {
      stopTimer();
      gameState.isRunning = false;
      gameState.wasPaused = true;
      gameState.pausedTime = gameState.timer;
      elements.startBtn.innerHTML = '<span class="material-icons align-middle me-2">play_arrow</span><span class="align-middle">Resume</span>';
      disableCards();
    }
  }

  function resumeGame() {
    gameState.isRunning = true;
    gameState.wasPaused = false;
    startTimer();
    elements.startBtn.innerHTML = '<span class="material-icons align-middle me-2">pause</span><span class="align-middle">Pause</span>';
    enableCards();
  }

  function resetGame() {
    stopTimer();
    gameState.isRunning = false;
    gameState.moves = 0;
    gameState.matchedPairs = 0;
    gameState.timer = 0;
    gameState.pausedTime = 0;
    gameState.flippedCards = [];
    gameState.wasPaused = false;

    elements.startBtn.disabled = false;
    elements.settingsBtn.disabled = false;
    elements.startBtn.innerHTML = '<span class="material-icons align-middle me-2">play_arrow</span><span class="align-middle">Start Game</span>';

    updateTimerDisplay();
    initializeGameBoard();
  }

  function initializeGameBoard() {
    elements.gameBoard.innerHTML = "";
    const totalCards = gameState.currentMode * gameState.currentMode;

    // Ensure even number of cards for pairs
    gameState.totalPairs = Math.floor(totalCards / 2);

    const cardPairs = createCardPairs(totalCards);
    elements.gameBoard.className = `game-board grid-${gameState.currentMode}x${gameState.currentMode}`;

    cardPairs.forEach((cardValue, index) => {
      const card = createCardElement(cardValue, index);
      elements.gameBoard.appendChild(card);
    });

    disableCards();
  }

  function createCardPairs(totalCards) {
    const neededPairs = Math.floor(totalCards / 2);
    const selectedCards = cardImages.slice(0, neededPairs).map((card) => card.name);
    return shuffleArray([...selectedCards, ...selectedCards]);
  }

  function createCardElement(value, index) {
    const card = document.createElement("div");
    card.className = "memory-card";
    card.dataset.value = value;
    card.dataset.index = index;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <img src="./media/retro.png" alt="card back" class="card-img">
        </div>
        <div class="card-back">
          <img src="./media/${value}.png" alt="card front" class="card-img">
        </div>
      </div>
    `;

    card.addEventListener("click", () => handleCardClick(card));
    return card;
  }

  function handleCardClick(card) {
    if (!gameState.isRunning || gameState.flippedCards.length >= 2 || card.classList.contains("flipped") || card.classList.contains("matched")) {
      return;
    }

    card.classList.add("flipped");
    gameState.flippedCards.push(card);

    if (gameState.flippedCards.length === 2) {
      gameState.moves++;
      checkForMatch();
    }
  }

  function checkForMatch() {
    const [card1, card2] = gameState.flippedCards;
    const match = card1.dataset.value === card2.dataset.value;

    if (match) {
      handleMatch(card1, card2);
    } else {
      handleMismatch(card1, card2);
    }
  }

  function handleMatch(card1, card2) {
    card1.classList.add("matched");
    card2.classList.add("matched");
    gameState.matchedPairs++;
    gameState.flippedCards = [];

    const totalCards = gameState.currentMode * gameState.currentMode;
    if (gameState.matchedPairs === Math.floor(totalCards / 2)) {
      setTimeout(handleGameWin, 500);
    }
  }

  function handleMismatch(card1, card2) {
    card1.classList.add("wrong");
    card2.classList.add("wrong");

    setTimeout(() => {
      card1.classList.remove("flipped", "wrong");
      card2.classList.remove("flipped", "wrong");
      gameState.flippedCards = [];
    }, 1000);
  }

  function loadSavedSettings() {
    const savedMode = localStorage.getItem("gameMode");
    if (savedMode) {
      gameState.currentMode = parseInt(savedMode);
      elements.gameMode.value = savedMode;
    }
  }

  function saveSettings() {
    resetGame();

    const newMode = parseInt(elements.gameMode.value);
    gameState.currentMode = newMode;
    localStorage.setItem("gameMode", newMode);
    modals.settingsModal.hide();

    if (gameState.isRunning) {
      resetGame();
    }
    initializeGameBoard();
  }

  function resetSettings() {
    gameState.currentMode = 3;
    elements.gameMode.value = "3";
    localStorage.setItem("gameMode", 3);
    initializeGameBoard();
  }

  function startTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
      gameState.timer++;
      updateTimerDisplay();
    }, 1000);
  }

  function stopTimer() {
    clearInterval(gameState.timerInterval);
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timer / 60);
    const seconds = gameState.timer % 60;
    elements.timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  function enableCards() {
    const cards = document.querySelectorAll(".memory-card");
    cards.forEach((card) => card.classList.remove("cards-disabled"));
  }

  function disableCards() {
    const cards = document.querySelectorAll(".memory-card");
    cards.forEach((card) => card.classList.add("cards-disabled"));
  }

  function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement("div");
    const rect = button.getBoundingClientRect();

    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height)}px`;
    ripple.style.left = `${event.clientX - rect.left - ripple.offsetWidth / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - ripple.offsetHeight / 2}px`;

    button.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  function calculateScore() {
    const baseScore = 1000;
    const timeDeduction = Math.floor(gameState.timer / 2);
    const movesDeduction = gameState.moves * 10;
    const difficultyMultiplier = {
      3: 0.8, // Easy
      4: 1.0, // Medium
      5: 1.2, // Hard
    }[gameState.currentMode];

    return Math.max(0, Math.floor((baseScore - timeDeduction - movesDeduction) * difficultyMultiplier));
  }

  function saveGameHistory(score) {
    const gameData = {
      mode: gameState.currentMode,
      time: gameState.timer,
      moves: gameState.moves,
      score: score,
      date: new Date().toISOString(),
    };

    const history = JSON.parse(localStorage.getItem("gameHistory")) || [];
    history.unshift(gameData);
    localStorage.setItem("gameHistory", JSON.stringify(history.slice(0, 10)));
  }

  init();
});
