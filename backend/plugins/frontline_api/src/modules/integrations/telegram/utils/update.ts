import { z } from 'zod';

export const telegramUpdateSchema = z
  .object({
    update_id: z.number().int().nonnegative().safe(),
  })
  .passthrough();

export type TelegramUpdate = z.infer<typeof telegramUpdateSchema>;
