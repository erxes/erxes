import { z } from 'zod';
import { accountSchema } from '../constants/accountSchema';

export type TAccountForm = z.infer<typeof accountSchema>;
