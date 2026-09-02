import { Model } from 'mongoose';

import { ICallAgentPauseStatsDocument } from '@/integrations/call/@types/agentPauseStats';
import { agentPauseStatsSchema } from '@/integrations/call/db/definitions/agentPauseStats';

export type ICallAgentPauseStatsModel = Model<ICallAgentPauseStatsDocument>;

export const loadCallAgentPauseStatsClass = () => {
  class CallAgentPauseStats {}

  agentPauseStatsSchema.loadClass(CallAgentPauseStats);

  return agentPauseStatsSchema;
};
