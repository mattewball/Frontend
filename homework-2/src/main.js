import { z } from "zod";
import confetti from "canvas-confetti";
import { SnakeGame } from "./GameEngine.js";

const GameStateSchema = z.object({
  width: z.number().min(5).max(60),
  height: z.number().min(5).max(60),
  snake: z.array(z.object({ x: z.number(), y: z.number() })),
  food: z.object({ x: z.number(), y: z.number() }),
  score: z.number().nonnegative(),
  direction: z.object({ x: z.number(), y: z.number() }),
  nextDirection: z.object({ x: z.number(), y: z.number() }),
  isStarted: z.boolean(),
  isGameOver: z.boolean(),
  isVictory: z.boolean()
});

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const widthInput = document.getElementById("width_input");
const heightInput = document.getElementById("height_input");
const applyBtn = document.getElementById("apply-btn");
const currentScoreEl = document.getElementById("current-score");
const bestScoreEl = document.getElementById("best-score");
const overlay = document.getElementById("game-overlay");
const textMain = document.getElementById("overlay-text-main");
const textSub = document.getElementById("overlay-text-sub");
const playerNameInput = document.getElementById("player-name");
const logList = document.getElementById("log-list");

const game = new SnakeGame();
let lastTime = 0;
let accumulator = 0;
const SNAKE_STEP_TIME = 130;
let animationFrameId = null;

let highScore = parseInt(localStorage.getItem("snake_high_score") || "0", 10);
let logs = JSON.parse(localStorage.getItem("snake_game_logs") || "[]");

function saveGame() {
  localStorage.setItem("snake_saved_state", JSON.stringify(game.getState()));
  localStorage.setItem("snake_player_name", playerNameInput.value);
}

function loadGameSafe() {
  const savedName = localStorage.getItem("snake_player_name");
  if (savedName) playerNameInput.value = savedName;

  try {
    const rawData = localStorage.getItem("snake_saved_state");
    if (!rawData) return false;

    const parsed = JSON.parse(rawData);
    const validatedState = GameStateSchema.parse(parsed);

    game.loadState(validatedState);
    widthInput.value = game.width;
    heightInput.value = game.height;
    return true;
  } catch {
    localStorage.removeItem("snake_saved_state");
    return false;
  }
}

function updateLogList(message) {
  if (message) {
    logs.unshift({ id: Date.now().toString(), text: message });
    if (logs.length > 5) logs.pop();
    localStorage.setItem("snake_game_logs", JSON.stringify(logs));
  }

  logList.innerHTML = "";
  logs.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.text;
    logList.appendChild(li);
  });
}

function initUI() {
  canvas.width = game.width * game.cellSize;
  canvas.height = game.height * game.cellSize;
  bestScoreEl.textContent = highScore;
  updateLogList();
  resetLoop();
}

function resetLoop() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  lastTime = performance.now();
  accumulator = 0;
  animationFrameId = requestAnimationFrame(gameLoop);
}

function gameLoop(currentTime) {
  animationFrameId = requestAnimationFrame(gameLoop);

  let deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  if (deltaTime > 100) deltaTime = 100;
  accumulator += deltaTime;

  const oldScore = game.score;

  while (accumulator >= SNAKE_STEP_TIME) {
    game.step();
    accumulator -= SNAKE_STEP_TIME;
  }

  if (game.score > oldScore) {
    updateLogList(
      `🍏 ${playerNameInput.value} съел фрукт! Счет: ${game.score}`
    );
    if (game.score > highScore) {
      highScore = game.score;
      bestScoreEl.textContent = highScore;
      localStorage.setItem("snake_high_score", highScore.toString());
    }
    saveGame();
  }

  draw();
  updateOverlay();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#252525";
  ctx.lineWidth = 1;
  for (let x = 0; x < game.width; x++) {
    for (let y = 0; y < game.height; y++) {
      ctx.strokeRect(
        x * game.cellSize,
        y * game.cellSize,
        game.cellSize,
        game.cellSize
      );
    }
  }

  if (!game.isVictory) {
    ctx.fillStyle = "red";
    ctx.fillRect(
      game.food.x * game.cellSize + 3,
      game.food.y * game.cellSize + 3,
      game.cellSize - 6,
      game.cellSize - 6
    );
  }

  game.snake.forEach((cell, index) => {
    ctx.fillStyle = index === 0 ? "green" : "lightgreen";
    ctx.fillRect(
      cell.x * game.cellSize + 1,
      cell.y * game.cellSize + 1,
      game.cellSize - 2,
      game.cellSize - 2
    );
  });

  currentScoreEl.textContent = game.score;
}

let confettiTriggered = false;

function updateOverlay() {
  if (!game.isStarted) {
    textMain.textContent = "Нажмите стрелочку, чтобы начать";
    textMain.style.color = "#fff";
    textSub.textContent = "Управление: Стрелочки клавиатуры";
    overlay.classList.remove("hidden");
    confettiTriggered = false;
  } else if (game.isGameOver) {
    textMain.textContent = "GAME OVER";
    textMain.style.color = "red";
    textSub.textContent = "Нажмите любую стрелочку для перезапуска";
    overlay.classList.remove("hidden");
    confettiTriggered = false;
  } else if (game.isVictory) {
    textMain.textContent = "ВЫИГРЫШ!";
    textMain.style.color = "#4CAF50";
    textSub.textContent = "Вы заполнили карту полностью!";
    overlay.classList.remove("hidden");

    if (!confettiTriggered) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      updateLogList(`🏆 ${playerNameInput.value} ПОБЕДИЛ В ИГРЕ!`);
      confettiTriggered = true;
    }
  } else {
    overlay.classList.add("hidden");
  }
}

window.addEventListener("keydown", e => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();

    if (game.isGameOver) {
      game.reset();
      saveGame();
      updateLogList(`🔄 Нарушена новая игра для ${playerNameInput.value}`);
      resetLoop();
      return;
    }

    game.changeDirection(e.key);
    saveGame();
  }
});

applyBtn.addEventListener("click", () => {
  const w = parseInt(widthInput.value, 10) || 20;
  const h = parseInt(heightInput.value, 10) || 15;
  game.width = w;
  game.height = h;
  game.reset();
  saveGame();
  initUI();
});

playerNameInput.addEventListener("input", () => {
  localStorage.setItem("snake_player_name", playerNameInput.value);
});

const hasSave = loadGameSafe();
initUI();
if (hasSave) {
  draw();
}
