import { test } from "node:test";
import assert from "node:assert";
import { SnakeGame } from "../GameEngine.js";

test("Правило 1: Инициализация змейки по центру", () => {
  const game = new SnakeGame(20, 10);
  assert.strictEqual(game.width, 20);
  assert.strictEqual(game.height, 10);
  assert.strictEqual(game.snake.length, 3);

  assert.strictEqual(game.snake[0].x, 10);
  assert.strictEqual(game.snake[0].y, 5);
});

test("Правило 2: Изменение направления и корректный шаг логики", () => {
  const game = new SnakeGame(20, 10);
  game.changeDirection("ArrowDown");
  game.step();

  assert.strictEqual(game.snake[0].x, 10);
  assert.strictEqual(game.snake[0].y, 6);
});

test("Правило 3: Сквозной телепорт через правую стену карты", () => {
  const game = new SnakeGame(10, 10);
  game.snake = [
    { x: 9, y: 5 },
    { x: 8, y: 5 },
    { x: 7, y: 5 }
  ];
  game.direction = { x: 1, y: 0 };
  game.nextDirection = { x: 1, y: 0 };
  game.isStarted = true;

  game.step();

  assert.strictEqual(game.snake[0].x, 0);
  assert.strictEqual(game.snake[0].y, 5);
});
