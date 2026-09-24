import {
  AiAgentDocument,
  aiAgentSchema,
  EventDispatcherReturn,
} from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  mergeAiAgentConnectionSecrets,
  scheduleAiAgentKnowledgeIndex,
  TAiAgentMutationDoc,
} from '../../utils/aiAgent';

export interface IAiAgentModel extends Model<AiAgentDocument> {
  getAgent(_id: string): Promise<AiAgentDocument>;
  createAgent(doc: TAiAgentMutationDoc): Promise<AiAgentDocument>;
  editAgent(
    _id: string,
    doc: TAiAgentMutationDoc,
  ): Promise<AiAgentDocument>;
  removeAgent(_id: string): Promise<{ success: true }>;
  reindexAgent(
    _id: string,
    fileId?: string,
  ): Promise<{ status: string; agentId: string; fileId?: string }>;
}

export const loadAiAgentClass = (
  models: IModels,
  subdomain: string,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class AiAgent {
    public static async getAgent(_id: string) {
      const agent = await models.AiAgents.findOne({ _id });

      if (!agent) {
        throw new Error('AI agent not found');
      }

      return agent;
    }

    public static async createAgent(doc: TAiAgentMutationDoc) {
      const agent = await models.AiAgents.create(doc);

      sendDbEventLog({
        action: 'create',
        docId: agent._id,
        currentDocument: agent,
      });

      await scheduleAiAgentKnowledgeIndex({ subdomain, agentId: agent._id });

      return agent;
    }

    public static async editAgent(_id: string, doc: TAiAgentMutationDoc) {
      const current = await models.AiAgents.getAgent(_id);

      // A masked secret means "unchanged", never "cleared".
      const merged = mergeAiAgentConnectionSecrets(current, doc);

      const updated = await models.AiAgents.findOneAndUpdate(
        { _id },
        { $set: { ...merged } },
        { runValidators: true, new: true },
      );

      if (!updated) {
        throw new Error('AI agent not found');
      }

      sendDbEventLog({
        action: 'update',
        docId: _id,
        prevDocument: current,
        currentDocument: updated,
      });

      await scheduleAiAgentKnowledgeIndex({ subdomain, agentId: _id });

      return updated;
    }

    public static async removeAgent(_id: string) {
      await models.AiAgents.getAgent(_id);

      const dependents = await models.Automations.find(
        {
          $or: [
            { 'actions.config.aiAgentId': _id },
            { 'workflows.actions.config.aiAgentId': _id },
          ],
        },
        { name: 1, status: 1 },
      ).lean();

      if (dependents.length) {
        const names = dependents
          .map(({ name, status }) => `${name || 'Untitled'} (${status})`)
          .join(', ');

        throw new Error(
          `This AI agent is used by ${dependents.length} automation(s): ${names}. ` +
            'Remove it from them before deleting the agent.',
        );
      }

      await models.AiAgents.deleteOne({ _id });

      sendDbEventLog({ action: 'delete', docId: _id });

      await scheduleAiAgentKnowledgeIndex({ subdomain, agentId: _id });

      return { success: true as const };
    }

    public static async reindexAgent(_id: string, fileId?: string) {
      const agent = await models.AiAgents.getAgent(_id);

      if (
        fileId &&
        !agent.context?.files?.some(
          (file: { id: string }) => file.id === fileId,
        )
      ) {
        throw new Error('AI agent context file not found');
      }

      await scheduleAiAgentKnowledgeIndex({ subdomain, agentId: _id, fileId });

      return { status: 'queued', agentId: _id, fileId };
    }
  }

  aiAgentSchema.loadClass(AiAgent);

  return aiAgentSchema;
};
