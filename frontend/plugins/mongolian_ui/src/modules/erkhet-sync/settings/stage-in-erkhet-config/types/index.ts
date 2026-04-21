import { z } from 'zod';
import { addStageInErkhetConfigSchema } from '../constants/addStageInErkhetConfigSchema';

export type TErkhetConfig = z.infer<typeof addStageInErkhetConfigSchema>;
