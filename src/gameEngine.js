export function createGame(countries) {
  if (!Array.isArray(countries) || countries.length < 2) {
    throw new Error("Need at least two countries to play");
  }

  const state = {
    countries,
    score: 0,
    finished: false,
    won: false,
    currentPair: null,
  };

  state.currentPair = pickRandomPair(countries);
  return state;
}

export function pickRandomPair(countries) {
  const n = countries.length;
  if (n < 2) throw new Error("Need at least two countries");

  let i = Math.floor(Math.random() * n);
  let j;
  do {
    j = Math.floor(Math.random() * n);
  } while (j === i);

  return {
    left: countries[i],
    right: countries[j],
  };
}

function biggerCountry(pair) {
  // Single mode: land area
  const field = "area";
  return pair.left[field] >= pair.right[field] ? pair.left : pair.right;
}

// Evaluate a guess and update state in-place.
// Returns a result object so callers don't have to inspect state directly.
export function makeGuess(state, guessedCode) {
  if (state.finished) {
    return {
      correct: false,
      gameOver: true,
      won: state.won,
      score: state.score,
      nextPair: null,
    };
  }

  const { currentPair } = state;
  const correctCountry = biggerCountry(currentPair);
  const correct = correctCountry.code === guessedCode;

  if (correct) {
    state.score += 1;
    if (state.score >= 20) {
      state.finished = true;
      state.won = true;
      return {
        correct: true,
        gameOver: true,
        won: true,
        score: state.score,
        nextPair: null,
      };
    }
    // Not finished yet; caller decides when to advance to the next round
    return {
      correct: true,
      gameOver: false,
      won: false,
      score: state.score,
      nextPair: null,
    };
  } else {
    // Wrong guess ends the game immediately
    state.finished = true;
    state.won = false;
    return {
      correct: false,
      gameOver: true,
      won: false,
      score: state.score,
      nextPair: null,
    };
  }
}
