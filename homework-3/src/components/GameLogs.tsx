import { LogItem } from "../types";

interface Props {
  logs: LogItem[];
  onRemove: (id: string) => void;
}

export const GameLogs = ({ logs, onRemove }: Props) => (
  <div className="logs-container">
    <h3>Логи игры (нажмите для удаления)</h3>
    <ul id="log-list">
      {logs.map(log => (
        <li
          key={log.id}
          onClick={() => onRemove(log.id)}
          style={{ cursor: "pointer" }}
        >
          {log.text}
        </li>
      ))}
    </ul>
  </div>
);
