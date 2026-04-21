import { z } from 'zod';
import { addStageInMovementErkhetConfigSchema } from '../constants/addStageInErkhetMovementConfigSchema';

export type TMovementErkhetConfig = z.infer<typeof addStageInMovementErkhetConfigSchema>;
