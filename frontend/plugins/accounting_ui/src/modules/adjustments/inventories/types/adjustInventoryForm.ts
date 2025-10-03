import { z } from 'zod';
import { adjustInventorySchema } from './adjustInventorySchema';

export type TAdjustInventoryForm = z.infer<typeof adjustInventorySchema>;
