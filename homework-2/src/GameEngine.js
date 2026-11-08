export class SnakeGame {
  constructor(width = 20, height = 15) {
    this.width = width;
    this.height = height;
    this.cellSize = 30;
    this.reset();
  }

  reset() {
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.isStarted = false;
    this.isGameOver = false;
    this.isVictory = false;
    this.score = 0;

    const startX = Math.floor(this.width / 2);
    const startY = Math.floor(this.height / 2);

    this.snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ];
    this.spawnFood();
  }

  spawnFood() {
    if (this.snake.length >= this.width * this.height) {
      this.isVictory = true;
      return;
    }
    while (true) {
      const foodX = Math.floor(Math.random() * this.width);
      const foodY = Math.floor(Math.random() * this.height);
      const isOnSnake = this.snake.some(
        cell => cell.x === foodX && cell.y === foodY
      );
      if (!isOnSnake) {
        this.food = { x: foodX, y: foodY };
        break;
      }
    }
  }

  changeDirection(key) {
    switch (key) {
      case "ArrowUp":
        if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
        this.isStarted = true;
        break;
      case "ArrowDown":
        if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
        this.isStarted = true;
        break;
      case "ArrowLeft":
        if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
        this.isStarted = true;
        break;
      case "ArrowRight":
        if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
        this.isStarted = true;
        break;
    }
  }

  step() {
    if (!this.isStarted || this.isGameOver || this.isVictory) return;

    this.direction = this.nextDirection;
    let nextHeadX = this.snake[0].x + this.direction.x;
    let nextHeadY = this.snake[0].y + this.direction.y;

    if (nextHeadX >= this.width) nextHeadX = 0;
    else if (nextHeadX < 0) nextHeadX = this.width - 1;

    if (nextHeadY >= this.height) nextHeadY = 0;
    else if (nextHeadY < 0) nextHeadY = this.height - 1;

    const isBitten = this.snake.some(
      cell => cell.x === nextHeadX && cell.y === nextHeadY
    );
    if (isBitten) {
      this.isGameOver = true;
      return;
    }

    const newHead = { x: nextHeadX, y: nextHeadY };
    this.snake.unshift(newHead);

    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score++;
      this.spawnFood();
      if (this.snake.length === this.width * this.height) {
        this.isVictory = true;
      }
    } else {
      this.snake.pop();
    }
  }

  getState() {
    return {
      width: this.width,
      height: this.height,
      snake: this.snake,
      food: this.food,
      score: this.score,
      direction: this.direction,
      nextDirection: this.nextDirection,
      isStarted: this.isStarted,
      isGameOver: this.isGameOver,
      isVictory: this.isVictory
    };
  }

  loadState(state) {
    this.width = state.width;
    this.height = state.height;
    this.snake = state.snake;
    this.food = state.food;
    this.score = state.score;
    this.direction = state.direction;
    this.nextDirection = state.nextDirection;
    this.isStarted = state.isStarted;
    this.isGameOver = state.isGameOver;
    this.isVictory = state.isVictory;
  }
}
