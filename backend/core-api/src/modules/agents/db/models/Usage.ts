import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { agentsUsageSchema } from '@/agents/db/definitions/usage';
import {
  IAgentsTokenUsage,
  IAgentsUsage,
  IAgentsUsageDocument,
} from '@/agents/@types/usage';

export interface IAgentsUsageModel extends Model<IAgentsUsageDocument> {
  getMonthUsage(month: string): Promise<IAgentsUsage>;
  recordUsage(month: string, usage: IAgentsTokenUsage): Promise<void>;
}

const toCount = (value: number) =>
  Number.isFinite(value) && value > 0 ? Math.round(value) : 0;

export const loadAgentsUsageClass = (models: IModels) => {
  class AgentsUsage {
    public static async getMonthUsage(month: string): Promise<IAgentsUsage> {
      const usage = await models.AgentsUsage.findOne({
        _id: month,
      }).lean<IAgentsUsageDocument | null>();

      return {
        month,
        inputTokens: usage?.inputTokens || 0,
        outputTokens: usage?.outputTokens || 0,
        totalTokens: usage?.totalTokens || 0,
      };
    }

    public static async recordUsage(
      month: string,
      usage: IAgentsTokenUsage,
    ): Promise<void> {
      const inputTokens = toCount(usage.inputTokens);
      const outputTokens = toCount(usage.outputTokens);
      const totalTokens =
        toCount(usage.totalTokens) || inputTokens + outputTokens;

      if (!totalTokens) {
        return;
      }

      await models.AgentsUsage.updateOne(
        { _id: month },
        {
          $setOnInsert: { month },
          $inc: { inputTokens, outputTokens, totalTokens },
        },
        { upsert: true },
      );
    }
  }

  agentsUsageSchema.loadClass(AgentsUsage);

  return agentsUsageSchema;
};
