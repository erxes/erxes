import { z } from 'zod';

export const BOARD_CREATE_SCHEMA = z.object({
  name: z.string(),
});
