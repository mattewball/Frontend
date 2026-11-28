import { z } from "zod";

export const CoordinateSchema = z.object({
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative()
});

export const DirectionSchema = z
  .object({
    x: z.number().int().min(-1).max(1),
    y: z.number().int().min(-1).max(1)
  })
  .refine(data => Math.abs(data.x) + Math.abs(data.y) === 1, {
    message:
      "Вектор направления должен быть ненулевым и указывать строго по одной оси"
  });

export const GameStateSchema = z
  .object({
    width: z.number().int().min(5).max(60),
    height: z.number().int().min(5).max(60),
    snake: z.array(CoordinateSchema).min(1, "Змейка не может быть пустой"),
    food: CoordinateSchema,
    score: z.number().int().nonnegative(),
    direction: DirectionSchema,
    nextDirection: DirectionSchema,
    isStarted: z.boolean(),
    isGameOver: z.boolean(),
    isVictory: z.boolean()
  })
  .superRefine((data, ctx) => {
    data.snake.forEach((cell, index) => {
      if (cell.x >= data.width || cell.y >= data.height) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Сегмент змейки на позиции ${index} вышел за границы поля`,
          path: ["snake", index]
        });
      }
    });

    if (data.food.x >= data.width || data.food.y >= data.height) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Еда находится за пределами поля",
        path: ["food"]
      });
    }

    const seenCells = new Set<string>();
    data.snake.forEach((cell, index) => {
      const key = `${cell.x},${cell.y}`;
      if (seenCells.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Дублирующийся (пересекающийся) сегмент змейки на позиции ${index}`,
          path: ["snake", index]
        });
      }
      seenCells.add(key);
    });

    for (let i = 1; i < data.snake.length; i++) {
      const prev = data.snake[i - 1];
      const curr = data.snake[i];

      let dx = Math.abs(prev.x - curr.x);
      if (dx === data.width - 1) dx = 1;

      let dy = Math.abs(prev.y - curr.y);
      if (dy === data.height - 1) dy = 1;

      if (dx + dy !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Тело змейки разорвано: сегмент ${i} не прилегает к ${i - 1}`,
          path: ["snake", i]
        });
      }
    }

    const isFoodInsideSnake = data.snake.some(
      cell => cell.x === data.food.x && cell.y === data.food.y
    );
    if (isFoodInsideSnake) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Еда не может находиться внутри змейки",
        path: ["food"]
      });
    }

    if (data.isVictory) {
      const totalCells = data.width * data.height;
      if (data.snake.length !== totalCells) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Победа зафиксирована, но змейка не заполнила всё поле полностью",
          path: ["isVictory"]
        });
      }
    }
  });

export const LogItemSchema = z.object({
  id: z.string(),
  text: z.string()
});

export const LogsArraySchema = z.array(LogItemSchema);
