import { z } from 'zod';
import { ebarimtSchema } from '../product-rules-on-tax/constants/ebarimtSchema';

export type TEBarimtForm = z.infer<typeof ebarimtSchema>;
