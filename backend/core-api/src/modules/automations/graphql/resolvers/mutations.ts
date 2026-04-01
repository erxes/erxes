import {
  AUTOMATION_STATUSES,
  IAutomation,
} from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { sanitizeAiAgent } from './utils/aiAgent';

export interface IAutomationsEdit extends IAutomation {
  _id: string;
}

const MASKED_SECRET_VALUE = '********';

const mergeAiAgentConnectionSecrets = (currentAgent: any, doc: any) => {
  if (!doc?.connection) {
    return doc;
  }

  const incomingApiKey = doc.connection?.config?.apiKey;
  const shouldPreserveApiKey =
    incomingApiKey === '' ||
    incomingApiKey === undefined ||
    incomingApiKey === MASKED_SECRET_VALUE;

  if (!shouldPreserveApiKey) {
    return doc;
  }

  return {
    ...doc,
    connection: {
      ...(currentAgent?.connection || {}),
      ...doc.connection,
      config: {
        ...(currentAgent?.connection?.config || {}),
        ...(doc.connection?.config || {}),
        apiKey: currentAgent?.connection?.config?.apiKey,
      },
    },
  };
};

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

  async automationsAiAgentAdd(_root, doc, { models }: IContext) {
    const agent = await models.AiAgents.create(doc);
    return sanitizeAiAgent(agent);
  },
  async automationsAiAgentEdit(_root, { _id, ...doc }, { models }: IContext) {
    const currentAgent = await models.AiAgents.findOne({ _id });

    if (!currentAgent) {
      throw new Error('AI agent not found');
    }

    const mergedDoc = mergeAiAgentConnectionSecrets(currentAgent, doc);

    await models.AiAgents.updateOne(
      { _id },
      { $set: { ...mergedDoc } },
      { runValidators: true },
    );

    return sanitizeAiAgent(await models.AiAgents.findOne({ _id }));
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
