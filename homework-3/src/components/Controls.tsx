interface Props {
  playerName: string;
  onNameChange: (name: string) => void;
  width: number;
  height: number;
  onWidthChange: (w: number) => void;
  onHeightChange: (h: number) => void;
  onApply: () => void;
}

export const Controls = ({
  playerName,
  onNameChange,
  width,
  height,
  onWidthChange,
  onHeightChange,
  onApply
}: Props) => (
  <div className="controls">
    <input
      type="text"
      id="player-name"
      placeholder="Ваше имя"
      value={playerName}
      onChange={e => onNameChange(e.target.value)}
    />

    <input
      type="number"
      id="width_input"
      value={width}
      onChange={e => onWidthChange(Number(e.target.value))}
      min="5"
      max="60"
      step="1"
    />

    <input
      type="number"
      id="height_input"
      value={height}
      onChange={e => onHeightChange(Number(e.target.value))}
      min="5"
      max="60"
      step="1"
    />

    <button id="apply-btn" onClick={onApply}>
      Обновить карту
    </button>
  </div>
);
