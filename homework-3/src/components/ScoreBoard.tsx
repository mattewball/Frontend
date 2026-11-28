interface Props {
  score: number;
  highScore: number;
}
export const ScoreBoard = ({ score, highScore }: Props) => (
  <div className="score-board">
    <span>
      Счет: <span id="current-score">{score}</span>
    </span>
    <span>
      Рекорд: <span id="best-score">{highScore}</span>
    </span>
  </div>
);
