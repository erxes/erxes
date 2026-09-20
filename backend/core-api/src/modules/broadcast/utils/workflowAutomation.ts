import {
  BROADCAST_AUTOMATION_TRIGGER_TYPE,
  CAMPAIGN_METHODS,
} from '@/broadcast/constants';
import {
  AUTOMATION_STATUSES,
  IAutomationAction,
} from 'erxes-api-shared/core-modules';
import { resumeHeldExecutions } from '@/automations/utils/service';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';

/**
 * A workflow campaign owns a real automation, the way an automation owns the
 * segment it creates: it is hidden from the automations list, edited through
 * the normal automation builder, and deleted with its owner.
 *
 * The campaign deliberately stores no automation id — the automation carries
 * `ownerContentId`, so there is one source of truth and nothing to keep in
 * sync.
 */
export const findCampaignAutomation = (models: IModels, campaignId: string) =>
  models.Automations.findOne({
    ownedBy: 'broadcast',
    ownerContentId: campaignId,
  }).lean();

export const createCampaignAutomation = async (
  models: IModels,
  {
    campaignId,
    title,
    userId,
    actions = [],
    entryActionId,
  }: {
    campaignId: string;
    title: string;
    userId: string;
    actions?: IAutomationAction[];
    entryActionId?: string;
  },
) => {
  const existing = await findCampaignAutomation(models, campaignId);

  if (existing) {
    return existing;
  }

  return models.Automations.create({
    name: title,
    status: AUTOMATION_STATUSES.DRAFT,
    ownedBy: 'broadcast',
    ownerContentId: campaignId,
    // One entry point, so the execution carries a real triggerId and history
    // and stats keep working unchanged. `actionId` is the step the flow starts
    // at: a run stops before it begins without one.
    triggers: [
      {
        id: nanoid(),
        type: BROADCAST_AUTOMATION_TRIGGER_TYPE,
        config: {},
        actionId: entryActionId,
      },
    ],
    actions,
    createdAt: new Date(),
    createdBy: userId,
    updatedBy: userId,
  });
};

/** Replaces the flow of the automation a campaign owns. */
export const setCampaignAutomationFlow = async (
  models: IModels,
  campaignId: string,
  {
    actions = [],
    entryActionId,
  }: { actions?: IAutomationAction[]; entryActionId?: string },
) => {
  await models.Automations.updateOne(
    { ownedBy: 'broadcast', ownerContentId: campaignId },
    {
      $set: {
        actions,
        // The step the flow starts at, kept on the trigger the campaign's
        // automation was created with.
        'triggers.0.actionId': entryActionId ?? null,
        updatedAt: new Date(),
      },
    },
  );
};

/** Mirrors the campaign's live state onto the automation it owns. */
export const setCampaignAutomationStatus = async (
  models: IModels,
  subdomain: string,
  campaignId: string,
  status: (typeof AUTOMATION_STATUSES)[keyof typeof AUTOMATION_STATUSES],
  /**
   * Whoever put the campaign live. Every run then acts for them, which is what
   * a step that files a ticket or opens a task needs: a person to do it as.
   */
  userId?: string,
) => {
  await models.Automations.updateOne(
    { ownedBy: 'broadcast', ownerContentId: campaignId },
    {
      $set: {
        status,
        updatedAt: new Date(),
        ...(userId ? { updatedBy: userId } : {}),
      },
    },
  );

  if (status !== AUTOMATION_STATUSES.ACTIVE) {
    return;
  }

  // Going live again leaves the recipients still in a delay held by the
  // automations service; they resume only when it is asked to arm them.
  const automation = await models.Automations.findOne(
    { ownedBy: 'broadcast', ownerContentId: campaignId },
    { _id: 1 },
  ).lean();

  if (automation) {
    await resumeHeldExecutions(subdomain, automation._id);
  }
};

export const removeCampaignAutomations = async (
  models: IModels,
  campaignIds: string[],
) => {
  if (!campaignIds.length) {
    return;
  }

  const automations = await models.Automations.find(
    { ownedBy: 'broadcast', ownerContentId: { $in: campaignIds } },
    { _id: 1 },
  ).lean();

  if (!automations.length) {
    return;
  }

  const automationIds = automations.map(({ _id }) => _id);

  await models.AutomationExecutions.removeExecutions(automationIds);
  await models.Automations.deleteMany({ _id: { $in: automationIds } });
};

export const isWorkflowCampaign = (method?: string) =>
  method === CAMPAIGN_METHODS.WORKFLOW;
