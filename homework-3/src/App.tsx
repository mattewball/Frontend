import { useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import { SnakeGame } from "./GameEngine";
import { GameStateSchema, LogsArraySchema } from "./schemas";
import { LogItem, GameState } from "./types";
import { ScoreBoard } from "./components/ScoreBoard";
import { Controls } from "./components/Controls";
import { GameLogs } from "./components/GameLogs";
import { GameCanvas } from "./components/GameCanvas";
import "./style.css";

export default function App() {
  const [engine] = useState(() => {
    const game = new SnakeGame();
    try {
      const savedGame = localStorage.getItem("snake_saved_state");
      if (savedGame) {
        const parsed = JSON.parse(savedGame);
        const validGame = GameStateSchema.safeParse(parsed);
        if (validGame.success) {
          game.loadState(validGame.data as GameState);
        } else {
          localStorage.removeItem("snake_saved_state");
        }
      }
    } catch (e) {
      console.error("Ошибка загрузки сохранения", e);
    }
    return game;
  });

  const [gameState, setGameState] = useState<GameState>(() =>
    engine.getState()
  );
  const [playerName, setPlayerName] = useState(
    () => localStorage.getItem("snake_player_name") || ""
  );

  const [logs, setLogs] = useState<LogItem[]>(() => {
    try {
      const savedLogs = localStorage.getItem("snake_game_logs");
      if (savedLogs) {
        const parsed = JSON.parse(savedLogs);
        const validLogs = LogsArraySchema.safeParse(parsed);
        if (validLogs.success) return validLogs.data;
      }
    } catch (e) {
      console.error("Ошибка загрузки логов", e);
    }
    return [];
  });

  const [highScore, setHighScore] = useState(() => {
    const hs = parseInt(localStorage.getItem("snake_high_score") || "0", 10);
    return isNaN(hs) ? 0 : hs;
  });

  const [inputWidth, setInputWidth] = useState(() => engine.width);
  const [inputHeight, setInputHeight] = useState(() => engine.height);

  const playerNameRef = useRef(playerName);
  const highScoreRef = useRef(highScore);

  useEffect(() => {
    playerNameRef.current = playerName;
    highScoreRef.current = highScore;
    localStorage.setItem("snake_player_name", playerName);
  }, [playerName, highScore]);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let accumulator = 0;
    const SNAKE_STEP_TIME = 130;

    const loop = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(loop);
      let deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      if (deltaTime > 100) deltaTime = 100;
      accumulator += deltaTime;

      const oldScore = engine.score;
      const oldIsVictory = engine.isVictory;
      let hasStepped = false;

      while (accumulator >= SNAKE_STEP_TIME) {
        engine.step();
        accumulator -= SNAKE_STEP_TIME;
        hasStepped = true;
      }

      if (hasStepped) {
        const newState = engine.getState();
        setGameState(newState);

        if (engine.score > oldScore) {
          setLogs(prev => {
            const newLogs = [
              {
                id: Date.now().toString(),
                text: `🍏 ${playerNameRef.current} съел фрукт! Счет: ${engine.score}`
              },
              ...prev
            ].slice(0, 5);
            localStorage.setItem("snake_game_logs", JSON.stringify(newLogs));
            return newLogs;
          });

          if (engine.score > highScoreRef.current) {
            setHighScore(engine.score);
            localStorage.setItem("snake_high_score", engine.score.toString());
          }
        }

        if (engine.isVictory && !oldIsVictory) {
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        }

        localStorage.setItem("snake_saved_state", JSON.stringify(newState));
      }
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [engine]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key))
        return;

      e.preventDefault();

      if (engine.isGameOver) {
        engine.reset();
        setGameState(engine.getState());
        localStorage.setItem(
          "snake_saved_state",
          JSON.stringify(engine.getState())
        );
        return;
      }

      engine.changeDirection(e.key);
      setGameState(engine.getState());
      localStorage.setItem(
        "snake_saved_state",
        JSON.stringify(engine.getState())
      );
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [engine]);

  const applySettings = useCallback(() => {
    const w = Math.min(Math.max(inputWidth || 20, 5), 60);
    const h = Math.min(Math.max(inputHeight || 15, 5), 60);

    setInputWidth(w);
    setInputHeight(h);

    engine.setSize(w, h);

    engine.reset();
    setGameState(engine.getState());
    localStorage.setItem(
      "snake_saved_state",
      JSON.stringify(engine.getState())
    );
  }, [engine, inputWidth, inputHeight]);

  const removeLog = (id: string) => {
    setLogs(prev => {
      const newLogs = prev.filter(l => l.id !== id);
      localStorage.setItem("snake_game_logs", JSON.stringify(newLogs));
      return newLogs;
    });
  };

  return (
    <div className="app-container">
      <h1>Змейка на React + TS</h1>
      <ScoreBoard score={gameState.score} highScore={highScore} />
      <Controls
        playerName={playerName}
        onNameChange={setPlayerName}
        width={inputWidth}
        onWidthChange={setInputWidth}
        height={inputHeight}
        onHeightChange={setInputHeight}
        onApply={applySettings}
      />
      <GameCanvas game={gameState} />
      <GameLogs logs={logs} onRemove={removeLog} />
    </div>
  );
}
