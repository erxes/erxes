import {
  AUTOMATION_STATUSES,
  checkPermission,
  IAutomation,
  IAutomationDoc,
} from 'erxes-api-shared/core-modules';
import { sendWorkerMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export interface IAutomationsEdit extends IAutomation {
  _id: string;
}

export const automationMutations = {
  /**
   * Creates a new automation
   */
  async automationsAdd(_root, doc: IAutomation, { user, models }: IContext) {
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
    { user, models }: IContext,
  ) {
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
    { models }: IContext,
  ) {
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
    { models }: IContext,
  ) {
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

  async automationsAiAgentAdd(_root, doc, { models }: IContext) {
    return await models.AiAgents.create(doc);
  },
  async automationsAiAgentEdit(_root, { _id, ...doc }, { models }: IContext) {
    return await models.AiAgents.updateOne({ _id }, { $set: { ...doc } });
  },

  async startAiTraining(_root, { agentId }, { subdomain }: IContext) {
    await sendWorkerMessage({
      pluginName: 'automations',
      queueName: 'aiAgent',
      jobName: 'trainAiAgent',
      subdomain,
      data: { agentId },
    });
    return await sendWorkerMessage({
      pluginName: 'automations',
      queueName: 'aiAgent',
      jobName: 'trainAiAgent',
      subdomain,
      data: { agentId },
    });
  },

  async generateAgentMessage(
    _root,
    { agentId, question },
    { subdomain }: IContext,
  ) {
    return await sendWorkerMessage({
      pluginName: 'automations',
      queueName: 'aiAgent',
      jobName: 'generateText',
      subdomain,
      data: { agentId, question },
    });
  },
};

checkPermission(automationMutations, 'automationsAdd', 'automationsAdd');
checkPermission(automationMutations, 'automationsEdit', 'automationsEdit');
checkPermission(automationMutations, 'automationsRemove', 'automationsRemove');
