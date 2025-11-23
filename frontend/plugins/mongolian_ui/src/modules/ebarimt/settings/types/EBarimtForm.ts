import { z } from 'zod';
import { addEBarimtReturnConfigSchema } from '@/ebarimt/settings/stage-in-return-ebarimt-config/types/addEBarimtReturnConfigSchema';

export type TEBarimtForm = z.infer<typeof addEBarimtReturnConfigSchema>;
