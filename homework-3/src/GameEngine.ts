import { GameState } from "./types";

export function createInitialState(width: number, height: number): GameState {
  const startX = Math.floor(width / 2);
  const startY = Math.floor(height / 2);
  const state: GameState = {
    width,
    height,
    snake: [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ],
    food: { x: 0, y: 0 },
    score: 0,
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    isStarted: false,
    isGameOver: false,
    isVictory: false
  };
  return spawnFood(state);
}

export function spawnFood(state: GameState): GameState {
  if (state.snake.length >= state.width * state.height) {
    return { ...state, isVictory: true };
  }
  let foodX = 0,
    foodY = 0;
  while (true) {
    foodX = Math.floor(Math.random() * state.width);
    foodY = Math.floor(Math.random() * state.height);
    const isOnSnake = state.snake.some(c => c.x === foodX && c.y === foodY);
    if (!isOnSnake) break;
  }
  return { ...state, food: { x: foodX, y: foodY } };
}

export function changeDirection(state: GameState, key: string): GameState {
  let nextDirection = state.nextDirection;
  switch (key) {
    case "ArrowUp":
      if (state.direction.y === 0) nextDirection = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (state.direction.y === 0) nextDirection = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (state.direction.x === 0) nextDirection = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (state.direction.x === 0) nextDirection = { x: 1, y: 0 };
      break;
  }
  return { ...state, isStarted: true, nextDirection };
}

export function step(state: GameState): GameState {
  if (!state.isStarted || state.isGameOver || state.isVictory) return state;

  const direction = state.nextDirection;
  let nextHeadX = state.snake[0].x + direction.x;
  let nextHeadY = state.snake[0].y + direction.y;

  if (nextHeadX >= state.width) nextHeadX = 0;
  else if (nextHeadX < 0) nextHeadX = state.width - 1;
  if (nextHeadY >= state.height) nextHeadY = 0;
  else if (nextHeadY < 0) nextHeadY = state.height - 1;

  const willEat = nextHeadX === state.food.x && nextHeadY === state.food.y;
  const snakeToCheck = willEat ? state.snake : state.snake.slice(0, -1);
  const isBitten = snakeToCheck.some(
    cell => cell.x === nextHeadX && cell.y === nextHeadY
  );

  if (isBitten) {
    return { ...state, isGameOver: true };
  }

  const newHead = { x: nextHeadX, y: nextHeadY };
  let newSnake = [newHead, ...state.snake];

  if (!willEat) {
    newSnake = newSnake.slice(0, -1);
  }

  const newState = { ...state, direction, snake: newSnake };

  if (willEat) {
    newState.score = state.score + 1;
    const stateWithFood = spawnFood(newState);
    if (
      stateWithFood.snake.length ===
      stateWithFood.width * stateWithFood.height
    ) {
      return { ...stateWithFood, isVictory: true };
    }
    return stateWithFood;
  }

  return newState;
}
