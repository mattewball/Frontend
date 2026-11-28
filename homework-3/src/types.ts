export interface Point {
  x: number;
  y: number;
}
export interface Direction {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
}

export interface GameState {
  width: number;
  height: number;
  snake: Point[];
  food: Point;
  score: number;
  direction: Direction;
  nextDirection: Direction;
  isStarted: boolean;
  isGameOver: boolean;
  isVictory: boolean;
}

export interface LogItem {
  id: string;
  text: string;
}
