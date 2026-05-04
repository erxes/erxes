import { z } from 'zod';
import { commentTriggerSchema } from '../schemas/commentTriggerSchema';

export type TCommentTriggerForm = z.infer<typeof commentTriggerSchema>;
