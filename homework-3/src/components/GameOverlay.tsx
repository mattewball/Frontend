import { GameState } from "../types";

export const GameOverlay = ({ game }: { game: GameState }) => {
  if (!game.isStarted && !game.isGameOver && !game.isVictory) {
    return (
      <div className="overlay">
        <h2>Нажмите стрелочку, чтобы начать</h2>
        <p>Управление: Стрелочки</p>
      </div>
    );
  }
  if (game.isGameOver) {
    return (
      <div className="overlay">
        <h2 style={{ color: "red" }}>GAME OVER</h2>
        <p>Нажмите стрелочку для перезапуска</p>
      </div>
    );
  }
  if (game.isVictory) {
    return (
      <div className="overlay">
        <h2 style={{ color: "#4CAF50" }}>ВЫИГРЫШ!</h2>
        <p>Карта заполнена!</p>
      </div>
    );
  }
  return null;
};
