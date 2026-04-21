import { z } from 'zod';
import { addPipelineRemainderConfigSchema } from '../constants/addPipelineRemainderConfigSchema';

export type TAddPipelineRemainderConfig = z.infer<typeof addPipelineRemainderConfigSchema>;
