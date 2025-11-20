import { createGame, makeGuess, pickRandomPair } from "./gameEngine.js";

let countries = [];
let gameState = null;
const startButton = document.getElementById("start-game");
const leftButton = document.getElementById("country-left");
const rightButton = document.getElementById("country-right");
const nextButton = document.getElementById("next-round");
const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");
const resultEl = document.getElementById("result");
const leftSizeEl = document.getElementById("country-left-size");
const rightSizeEl = document.getElementById("country-right-size");

async function loadCountriesOnce() {
  if (countries.length > 0) return;
  const resp = await fetch("countries.json");
  if (!resp.ok) {
    throw new Error("Failed to load countries.json");
  }
  countries = await resp.json();
}

function renderPair(pair) {
  const left = pair.left;
  const right = pair.right;

  leftButton.dataset.code = left.code;
  rightButton.dataset.code = right.code;

  const leftFlag = left.flagUrl;
  const rightFlag = right.flagUrl;

  if (leftFlag) {
    leftButton.innerHTML = `<img class="country-flag" src="${leftFlag}" alt="Flag of ${left.name}" loading="lazy" /> <span class="country-name">${left.name}</span>`;
  } else {
    leftButton.textContent = left.name;
  }

  if (rightFlag) {
    rightButton.innerHTML = `<img class="country-flag" src="${rightFlag}" alt="Flag of ${right.name}" loading="lazy" /> <span class="country-name">${right.name}</span>`;
  } else {
    rightButton.textContent = right.name;
  }

  // Clear any previous size display until after a guess
  if (leftSizeEl) leftSizeEl.textContent = "";
  if (rightSizeEl) rightSizeEl.textContent = "";
}

function renderScore() {
  scoreEl.textContent = String(gameState.score);
}

function renderGameOver(result) {
  const outcomeText = result.won
    ? `You won! Final score: ${result.score}`
    : `Game over. Final score: ${result.score}`;
  resultEl.textContent = outcomeText;
}

function formatAreaKm2(areaValue) {
  const rounded = Math.round(areaValue);
  return `${new Intl.NumberFormat("en-US").format(rounded)} km²`;
}

function showPairSizes(pair) {
  if (!leftSizeEl || !rightSizeEl) return;
  leftSizeEl.textContent = formatAreaKm2(pair.left.area);
  rightSizeEl.textContent = formatAreaKm2(pair.right.area);
}

async function startGameHandler() {
  resultEl.textContent = "";
  await loadCountriesOnce();
  gameState = createGame(countries);
  // Enable country buttons once a game is active
  leftButton.disabled = false;
  rightButton.disabled = false;
  nextButton.disabled = true;
  renderPair(gameState.currentPair);
  renderScore();
}

function handleGuess(code) {
  if (!gameState) return;
  const previousPair = gameState.currentPair;
  const result = makeGuess(gameState, code);
  renderScore();
  if (result.correct) {
    statusEl.textContent = "Correct! Click Next for another round.";
  } else {
    statusEl.textContent = "Incorrect.";
  }
  // After answering, reveal the areas for the pair that was just shown
  showPairSizes(previousPair);
  if (result.gameOver) {
    renderGameOver(result);
    // Disable further guesses after game over
    leftButton.disabled = true;
    rightButton.disabled = true;
    nextButton.disabled = true;
  } else {
    // Await user clicking "Next" to move on
    leftButton.disabled = true;
    rightButton.disabled = true;
    nextButton.disabled = false;
  }
}

function handleNextRound() {
  if (!gameState || gameState.finished) return;
  gameState.currentPair = pickRandomPair(gameState.countries);
  renderPair(gameState.currentPair);
  statusEl.textContent = "Which country is bigger?";
  leftButton.disabled = false;
  rightButton.disabled = false;
  nextButton.disabled = true;
}

// Wire up event listeners
startButton.addEventListener("click", startGameHandler);
leftButton.addEventListener("click", () =>
  handleGuess(leftButton.dataset.code),
);
rightButton.addEventListener("click", () =>
  handleGuess(rightButton.dataset.code),
);
nextButton.addEventListener("click", handleNextRound);
