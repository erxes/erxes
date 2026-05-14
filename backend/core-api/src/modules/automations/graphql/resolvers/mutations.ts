import {
  AUTOMATION_STATUSES,
  IAutomation,
} from 'erxes-api-shared/core-modules';
import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import {
  mergeAiAgentConnectionSecrets,
  sanitizeAiAgent,
  scheduleAiAgentKnowledgeIndex,
} from './utils/aiAgent';

export interface IAutomationsEdit extends IAutomation {
  _id: string;
}

export const automationMutations = {
  /**
   * Creates a new automation
   */
  async automationsAdd(
    _root,
    doc: IAutomation,
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('automationsCreate');

    const automation = await models.Automations.create({
      ...doc,
      createdAt: new Date(),
      createdBy: user._id,
      updatedBy: user._id,
    });

    return models.Automations.getAutomation(automation._id);
  },

  /**
   * Updates a automation
   */
  async automationsEdit(
    _root,
    { _id, ...doc }: IAutomationsEdit,
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('automationsUpdate');

    const automation = await models.Automations.getAutomation(_id);
    if (!automation) {
      throw new Error('Automation not found');
    }

    await models.Automations.updateOne(
      { _id },
      { $set: { ...doc, updatedAt: new Date(), updatedBy: user._id } },
    );

    return models.Automations.getAutomation(_id);
  },

  /**
   * Archive automations
   */

  async archiveAutomations(
    _root,
    { automationIds, isRestore },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('automationsUpdate');

    await models.Automations.updateMany(
      { _id: { $in: automationIds } },
      {
        $set: {
          status: isRestore
            ? AUTOMATION_STATUSES.DRAFT
            : AUTOMATION_STATUSES.ARCHIVED,
        },
      },
    );
    return automationIds;
  },
  /**
   * Removes automations
   */
  async automationsRemove(
    _root,
    { automationIds }: { automationIds: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('automationsDelete');

    const automations = await models.Automations.find({
      _id: { $in: automationIds },
    });

    let segmentIds: string[] = [];

    for (const automation of automations) {
      const { triggers, actions } = automation;

      const triggerIds = triggers.map((trigger) => {
        return trigger.config.contentId;
      });

      const actionIds = actions.map((action) => {
        return action.config.contentId;
      });

      segmentIds = [...triggerIds, ...actionIds];
    }

    await models.Automations.deleteMany({ _id: { $in: automationIds } });
    await models.AutomationExecutions.removeExecutions(automationIds);

    await models.Segments.deleteMany({ _id: { $in: segmentIds } });

    return automationIds;
  },

  async automationsAiAgentAdd(_root, doc, { models, subdomain }: IContext) {
    const agent = await models.AiAgents.create(doc);

    await scheduleAiAgentKnowledgeIndex({ subdomain, agentId: agent._id });

    return sanitizeAiAgent(agent);
  },
  async automationsAiAgentEdit(
    _root,
    { _id, ...doc },
    { models, subdomain }: IContext,
  ) {
    const currentAgent = await models.AiAgents.findOne({ _id });

    if (!currentAgent) {
      throw new Error('AI agent not found');
    }

    const mergedDoc = mergeAiAgentConnectionSecrets(currentAgent, doc);

    const updatedAgent = await models.AiAgents.findOneAndUpdate(
      { _id },
      { $set: { ...mergedDoc } },
      { runValidators: true, new: true },
    );

    if (updatedAgent?._id) {
      await scheduleAiAgentKnowledgeIndex({
        subdomain,
        agentId: updatedAgent._id,
      });
    }

    return sanitizeAiAgent(updatedAgent);
  },

  async automationsAiAgentReindex(
    _root,
    { _id, fileId }: { _id: string; fileId?: string },
    { models, subdomain }: IContext,
  ) {
    const agent = await models.AiAgents.findOne({ _id }).lean();

    if (!agent) {
      throw new Error('AI agent not found');
    }

    if (
      fileId &&
      !agent.context?.files?.some((file: { id: string }) => file.id === fileId)
    ) {
      throw new Error('AI agent context file not found');
    }

    await scheduleAiAgentKnowledgeIndex({
      subdomain,
      agentId: _id,
      fileId,
    });

    return { status: 'queued', agentId: _id, fileId };
  },

  /**
   * Creates a new email template
   */
  async automationEmailTemplatesAdd(
    _root,
    doc: { name: string; description?: string; content: string },
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('automationsCreate');

    const template = await models.AutomationEmailTemplates.createEmailTemplate({
      ...doc,
      createdBy: user._id,
    });

    return template;
  },

  /**
   * Updates an email template
   */
  async automationEmailTemplatesEdit(
    _root,
    {
      _id,
      ...doc
    }: { _id: string; name: string; description?: string; content: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('automationsUpdate');

    return models.AutomationEmailTemplates.updateEmailTemplate(_id, doc);
  },

  /**
   * Removes an email template
   */
  async automationEmailTemplatesRemove(
    _root,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('automationsDelete');

    await models.AutomationEmailTemplates.removeEmailTemplate(_id);
    return { success: true };
  },
};
