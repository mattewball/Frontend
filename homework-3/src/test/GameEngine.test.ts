import { createInitialState, step, changeDirection } from "../GameEngine";
import test from "node:test";
import assert from "node:assert";

test("Правило 1: Инициализация змейки по центру", () => {
  const game = createInitialState(20, 10);
  assert.strictEqual(game.width, 20);
  assert.strictEqual(game.height, 10);
  assert.strictEqual(game.snake.length, 3);
  assert.strictEqual(game.snake[0].x, 10);
  assert.strictEqual(game.snake[0].y, 5);
});

test("Правило 2: Изменение направления и корректный шаг логики", () => {
  let game = createInitialState(20, 10);
  game = changeDirection(game, "ArrowDown");
  game = step(game);
  assert.strictEqual(game.snake[0].x, 10);
  assert.strictEqual(game.snake[0].y, 6);
});

test("Правило 3: Сквозной телепорт через правую стену карты", () => {
  let game = createInitialState(10, 10);
  game = {
    ...game,
    snake: [
      { x: 9, y: 5 },
      { x: 8, y: 5 },
      { x: 7, y: 5 }
    ],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    isStarted: true
  };

  game = step(game);
  assert.strictEqual(game.snake[0].x, 0);
  assert.strictEqual(game.snake[0].y, 5);
});
