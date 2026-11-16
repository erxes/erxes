import { AUTOMATION_APPROVAL_CONTENT_TYPES } from '@/automations/constants';
import { IContext } from '~/connectionResolvers';

/** Versions hold the whole flow, so they open only to who may view it. */
const assertCanViewAutomation = async (
  { models, user, checkPermission }: IContext,
  automationId: string,
) => {
  await checkPermission('automationsRead');

  const automation = await models.Automations.getAutomation(automationId);

  if (!automation) {
    throw new Error('Automation not found');
  }

  await models.ApprovalLocks.assertAccess({
    user,
    contentType: AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION,
    contentId: automationId,
    ownerId: automation.createdBy,
    action: 'view',
  });
};

export const automationVersionQueries = {
  async automationVersions(
    _root: undefined,
    { automationId, nodeId }: { automationId: string; nodeId?: string },
    context: IContext,
  ) {
    await assertCanViewAutomation(context, automationId);

    return context.models.AutomationVersions.listVersions(automationId, nodeId);
  },

  async automationVersionDetail(
    _root: undefined,
    { _id }: { _id: string },
    context: IContext,
  ) {
    const version = await context.models.AutomationVersions.getVersion(_id);

    await assertCanViewAutomation(context, version.automationId);

    return version;
  },
};
