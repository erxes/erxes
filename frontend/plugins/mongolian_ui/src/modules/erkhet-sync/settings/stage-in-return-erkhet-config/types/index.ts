import { z } from 'zod';
import { addStageInReturnErkhetConfigSchema } from '@/erkhet-sync/settings/stage-in-return-erkhet-config/constants/addStageInReturnErkhetConfigSchema';

export type TReturnErkhetConfig = z.infer<typeof addStageInReturnErkhetConfigSchema>;
