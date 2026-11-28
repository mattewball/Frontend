import { useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import { createInitialState, step, changeDirection } from "./GameEngine";
import { GameStateSchema, LogsArraySchema } from "./schemas";
import { LogItem, GameState } from "./types";
import { safeGetItem, safeSetItem, safeRemoveItem } from "./storage";
import { ScoreBoard } from "./components/ScoreBoard";
import { Controls } from "./components/Controls";
import { GameLogs } from "./components/GameLogs";
import { GameCanvas } from "./components/GameCanvas";
import "./style.css";

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const savedGame = safeGetItem("snake_saved_state");
      if (savedGame) {
        const parsed = JSON.parse(savedGame);
        const validGame = GameStateSchema.safeParse(parsed);
        if (validGame.success) return validGame.data as GameState;
        else safeRemoveItem("snake_saved_state");
      }
    } catch (e) {
      console.error("Ошибка загрузки сохранения", e);
    }
    return createInitialState(20, 15);
  });

  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const [playerName, setPlayerName] = useState(
    () => safeGetItem("snake_player_name") || ""
  );

  const [logs, setLogs] = useState<LogItem[]>(() => {
    try {
      const savedLogs = safeGetItem("snake_game_logs");
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
    const hs = parseInt(safeGetItem("snake_high_score") || "0", 10);
    return isNaN(hs) ? 0 : hs;
  });

  const [inputWidth, setInputWidth] = useState(() => gameState.width);
  const [inputHeight, setInputHeight] = useState(() => gameState.height);

  const playerNameRef = useRef(playerName);
  const highScoreRef = useRef(highScore);

  useEffect(() => {
    playerNameRef.current = playerName;
    highScoreRef.current = highScore;
    safeSetItem("snake_player_name", playerName);
  }, [playerName, highScore]);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let accumulator = 0;
    const SNAKE_STEP_TIME = 130;

    const loop = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(loop);

      if (
        !gameStateRef.current.isStarted ||
        gameStateRef.current.isGameOver ||
        gameStateRef.current.isVictory
      ) {
        lastTime = currentTime;
        accumulator = 0;
        return;
      }

      let deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      if (deltaTime > 100) deltaTime = 100;
      accumulator += deltaTime;

      let currentState = gameStateRef.current;
      const oldScore = currentState.score;
      const oldIsVictory = currentState.isVictory;
      let hasStepped = false;

      while (accumulator >= SNAKE_STEP_TIME) {
        currentState = step(currentState);
        accumulator -= SNAKE_STEP_TIME;
        hasStepped = true;
      }

      if (hasStepped) {
        gameStateRef.current = currentState;
        setGameState(currentState);

        if (currentState.score > oldScore) {
          setLogs(prev => {
            const newLogs = [
              {
                id: Date.now().toString(),
                text: `🍏 ${playerNameRef.current} съел фрукт! Счет: ${currentState.score}`
              },
              ...prev
            ].slice(0, 5);
            safeSetItem("snake_game_logs", JSON.stringify(newLogs));
            return newLogs;
          });

          if (currentState.score > highScoreRef.current) {
            setHighScore(currentState.score);
            safeSetItem("snake_high_score", currentState.score.toString());
          }
        }

        if (currentState.isVictory && !oldIsVictory) {
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        }

        safeSetItem("snake_saved_state", JSON.stringify(currentState));
      }
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

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
      const current = gameStateRef.current;

      if (current.isGameOver) {
        const resetState = createInitialState(current.width, current.height);
        gameStateRef.current = resetState;
        setGameState(resetState);
        safeSetItem("snake_saved_state", JSON.stringify(resetState));
        return;
      }

      const newState = changeDirection(current, e.key);
      gameStateRef.current = newState;
      setGameState(newState);
      safeSetItem("snake_saved_state", JSON.stringify(newState));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const applySettings = useCallback(() => {
    const w = Math.min(Math.max(Math.floor(inputWidth || 20), 5), 60);
    const h = Math.min(Math.max(Math.floor(inputHeight || 15), 5), 60);

    setInputWidth(w);
    setInputHeight(h);

    const newState = createInitialState(w, h);
    gameStateRef.current = newState;
    setGameState(newState);
    safeSetItem("snake_saved_state", JSON.stringify(newState));
  }, [inputWidth, inputHeight]);

  const removeLog = (id: string) => {
    setLogs(prev => {
      const newLogs = prev.filter(l => l.id !== id);
      safeSetItem("snake_game_logs", JSON.stringify(newLogs));
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
