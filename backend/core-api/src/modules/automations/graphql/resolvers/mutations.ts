import {
  AUTOMATION_STATUSES,
  IAutomation,
  validateWorkflowBindings,
} from 'erxes-api-shared/core-modules';
import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { AUTOMATION_APPROVAL_CONTENT_TYPES } from '../../constants';
import {
  mergeAiAgentConnectionSecrets,
  sanitizeAiAgent,
  scheduleAiAgentKnowledgeIndex,
} from './utils/aiAgent';

export interface IAutomationsEdit extends IAutomation {
  _id: string;
}
const requestScheduleReconcile = async (subdomain: string) => {
  try {
    await sendWorkerQueue('automations', 'schedule').add(
      'reconcile-recurring-automations',
      { kind: 'reconcile', subdomain },
      { removeOnComplete: 10, removeOnFail: 10 },
    );
  } catch {
    // The recurring scheduler retries reconciliation every 60 seconds.
  }
};

export const automationMutations = {
  /**
   * Creates a new automation
   */
  async automationsAdd(
    _root,
    doc: IAutomation,
    { user, models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('automationsCreate');

    const automation = await models.Automations.create({
      ...doc,
      createdAt: new Date(),
      createdBy: user._id,
      updatedBy: user._id,
    });
    await requestScheduleReconcile(subdomain);

    return models.Automations.getAutomation(automation._id);
  },

  /**
   * Updates a automation
   */
  async automationsEdit(
    _root,
    { _id, ...doc }: IAutomationsEdit,
    { user, models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('automationsUpdate');

    const automation = await models.Automations.getAutomation(_id);
    if (!automation) {
      throw new Error('Automation not found');
    }

    await models.ApprovalLocks.assertAccess({
      user,
      contentType: AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION,
      contentId: _id,
      ownerId: automation.createdBy,
      action: 'edit',
    });

    // An active automation must not carry workflow bindings that cannot
    // resolve — fail here instead of at runtime.
    const nextStatus = doc.status ?? automation.status;

    if (nextStatus === AUTOMATION_STATUSES.ACTIVE) {
      const bindingErrors = validateWorkflowBindings(
        doc.workflows ?? automation.workflows,
        doc.actions ?? automation.actions,
      );

      if (bindingErrors.length) {
        throw new Error(`Cannot activate automation: ${bindingErrors.join('; ')}`);
      }
    }

    await models.Automations.updateOne(
      { _id },
      { $set: { ...doc, updatedAt: new Date(), updatedBy: user._id } },
    );
    await requestScheduleReconcile(subdomain);

    return models.Automations.getAutomation(_id);
  },

  /**
   * Archive automations
   */

  async archiveAutomations(
    _root,
    { automationIds, isRestore },
    { models, user, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('automationsUpdate');

    const automations = await models.Automations.find({
      _id: { $in: automationIds },
    }).lean();

    for (const automation of automations) {
      await models.ApprovalLocks.assertAccess({
        user,
        contentType: AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION,
        contentId: automation._id,
        ownerId: automation.createdBy,
        action: 'edit',
      });
    }

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
    await requestScheduleReconcile(subdomain);
    return automationIds;
  },
  /**
   * Removes automations
   */
  async automationsRemove(
    _root,
    { automationIds }: { automationIds: string[] },
    { models, user, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('automationsDelete');

    const automations = await models.Automations.find({
      _id: { $in: automationIds },
    });

    for (const automation of automations) {
      await models.ApprovalLocks.assertAccess({
        user,
        contentType: AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION,
        contentId: automation._id,
        ownerId: automation.createdBy,
        action: 'delete',
      });
    }

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
    await requestScheduleReconcile(subdomain);

    return automationIds;
  },

  async automationsAiAgentAdd(
    _root,
    doc,
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('automationsAiAgentAdd');

    const agent = await models.AiAgents.create(doc);

    await scheduleAiAgentKnowledgeIndex({ subdomain, agentId: agent._id });

    return sanitizeAiAgent(agent);
  },
  async automationsAiAgentEdit(
    _root,
    { _id, ...doc },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('automationsAiAgentEdit');

    const currentAgent = await models.AiAgents.findOne({ _id });

    if (!currentAgent) {
      throw new Error('AI agent not found');
    }

    await models.ApprovalLocks.assertAccess({
      user,
      contentType: AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION_AI_AGENT,
      contentId: _id,
      action: 'edit',
    });

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

  async automationsAiAgentRemove(
    _root,
    { _id }: { _id: string },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('automationsAiAgentRemove');

    const agent = await models.AiAgents.findOne({ _id });

    if (!agent) {
      throw new Error('AI agent not found');
    }

    await models.ApprovalLocks.assertAccess({
      user,
      contentType: AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION_AI_AGENT,
      contentId: _id,
      action: 'delete',
    });

    await models.AiAgents.deleteOne({ _id });
    await scheduleAiAgentKnowledgeIndex({ subdomain, agentId: _id });

    return { success: true };
  },

  async automationsAiAgentReindex(
    _root,
    { _id, fileId }: { _id: string; fileId?: string },
    { models, subdomain, user }: IContext,
  ) {
    const agent = await models.AiAgents.findOne({ _id }).lean();

    if (!agent) {
      throw new Error('AI agent not found');
    }

    await models.ApprovalLocks.assertAccess({
      user,
      contentType: AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION_AI_AGENT,
      contentId: _id,
      action: 'edit',
    });

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

  /**
   * Creates a workflow template
   */
  async automationWorkflowTemplatesAdd(
    _root,
    doc: {
      name: string;
      description?: string;
      entryActionId?: string;
      actions: Record<string, any>[];
      inputs?: Record<string, string>;
    },
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('automationsCreate');

    return models.AutomationWorkflowTemplates.createWorkflowTemplate({
      ...doc,
      createdBy: user._id,
    });
  },

  /**
   * Updates a workflow template (e.g. pushing edits made to an inserted
   * instance back to its source template)
   */
  async automationWorkflowTemplatesEdit(
    _root,
    {
      _id,
      ...doc
    }: {
      _id: string;
      name?: string;
      description?: string;
      entryActionId?: string;
      actions?: Record<string, any>[];
      inputs?: Record<string, string>;
    },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('automationsUpdate');

    return models.AutomationWorkflowTemplates.updateWorkflowTemplate(_id, doc);
  },

  /**
   * Removes a workflow template
   */
  async automationWorkflowTemplatesRemove(
    _root,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('automationsDelete');

    await models.AutomationWorkflowTemplates.removeWorkflowTemplate(_id);
    return { success: true };
  },
};
