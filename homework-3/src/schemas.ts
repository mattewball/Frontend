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
          message: `Сегмент змейки вне поля`,
          path: ["snake", index]
        });
      }
    });
    if (data.food.x >= data.width || data.food.y >= data.height) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Еда вне поля",
        path: ["food"]
      });
    }
  });

export const LogItemSchema = z.object({
  id: z.string(),
  text: z.string()
});

export const LogsArraySchema = z.array(LogItemSchema);
