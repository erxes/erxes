import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { workingMemorySchema } from '@/memory/db/definitions/workingMemory';
import { IMastraWorkingMemoryDocument } from '@/memory/@types/workingMemory';

export interface IMastraWorkingMemoryModel extends Model<IMastraWorkingMemoryDocument> {
  getMemory(
    resourceId: string,
    agentId: string,
  ): Promise<IMastraWorkingMemoryDocument | null>;
  getContent(resourceId: string, agentId: string): Promise<string>;
  saveMemory(
    resourceId: string,
    agentId: string,
    content: string,
  ): Promise<IMastraWorkingMemoryDocument>;
}

export const loadWorkingMemoryClass = (_models: IModels) => {
  class MastraWorkingMemory {
    public static async getMemory(resourceId: string, agentId: string) {
      return _models.MastraWorkingMemory.findOne({ resourceId, agentId });
    }

    public static async getContent(resourceId: string, agentId: string) {
      const doc = await _models.MastraWorkingMemory.findOne({
        resourceId,
        agentId,
      });
      return doc?.content || '';
    }

    // Upsert keyed by (resourceId, agentId) — one profile per pair.
    public static async saveMemory(
      resourceId: string,
      agentId: string,
      content: string,
    ) {
      return _models.MastraWorkingMemory.findOneAndUpdate(
        { resourceId, agentId },
        { $set: { content, updatedAt: new Date() } },
        { new: true, upsert: true },
      );
    }
  }

  workingMemorySchema.loadClass(MastraWorkingMemory);
  return workingMemorySchema;
};
