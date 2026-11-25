import { useEffect, useRef } from "react";
import { GameState } from "../types";
import { GameOverlay } from "./GameOverlay";

export const GameCanvas = ({ game }: { game: GameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = game.width * 30;
    canvas.height = game.height * 30;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#252525";
    for (let x = 0; x < game.width; x++) {
      for (let y = 0; y < game.height; y++) {
        ctx.strokeRect(x * 30, y * 30, 30, 30);
      }
    }

    if (!game.isVictory) {
      ctx.fillStyle = "red";
      ctx.fillRect(game.food.x * 30 + 3, game.food.y * 30 + 3, 24, 24);
    }

    game.snake.forEach((cell, index) => {
      ctx.fillStyle = index === 0 ? "green" : "lightgreen";
      ctx.fillRect(cell.x * 30 + 1, cell.y * 30 + 1, 28, 28);
    });
  }, [game]);

  return (
    <div className="game-wrapper">
      <canvas ref={canvasRef} id="game" />
      <GameOverlay game={game} />
    </div>
  );
};
