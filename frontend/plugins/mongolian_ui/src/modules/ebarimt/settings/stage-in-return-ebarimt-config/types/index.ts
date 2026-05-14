import { z } from 'zod';
import { addEBarimtReturnConfigSchema } from '@/ebarimt/settings/stage-in-return-ebarimt-config/types/addEBarimtReturnConfigSchema';

export interface ReturnEbarimtConfig {
  title: string;
  destinationStageBoard: string;
  pipelineId: string;
  stageId: string;
  userEmail?: string;
  hasVat: boolean;
  hasCitytax: boolean;
}

export type TReturnEbarimtConfig = z.infer<typeof addEBarimtReturnConfigSchema>;
