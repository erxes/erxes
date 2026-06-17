import { IUserDocument } from 'erxes-api-shared/core-types';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IContext, IModels } from '~/connectionResolvers';
import { IMastraSchedule } from '@/schedule/@types/schedule';
import { runSchedule } from '~/mastra/schedules/runner';

/** Resolve the logged-in user's _id, rejecting unauthenticated calls. */
const requireUserId = (user: IUserDocument | null | undefined): string => {
  const userId = user?._id;
  if (!userId) throw new ExpectedError('Login required');
  return userId;
};

/** The referenced agent must exist and be enabled before a schedule saves. */
const assertAgentRunnable = async (models: IModels, agentId: unknown) => {
  if (typeof agentId !== 'string' || !agentId) {
    throw new ExpectedError('agentId must be a non-empty string');
  }
  const agent = await models.MastraAgent.findOne({ agentId, isEnabled: true });
  if (!agent)
    throw new ExpectedError(`Agent "${agentId}" not found or disabled`);
};

/** Mutations for scheduled agent runs. */
export const scheduleMutations = {
  mastraScheduleCreate: async (
    _parent: undefined,
    { doc }: { doc: IMastraSchedule },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('schedulesCreate');
    const userId = requireUserId(user);
    await assertAgentRunnable(models, doc.agentId);
    return models.MastraSchedule.createSchedule({
      ...doc,
      createdByUserId: userId,
    });
  },

  mastraScheduleUpdate: async (
    _parent: undefined,
    { _id, doc }: { _id: string; doc: Partial<IMastraSchedule> },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('schedulesEdit');
    requireUserId(user);
    if (doc.agentId !== undefined) {
      await assertAgentRunnable(models, doc.agentId);
    }
    return models.MastraSchedule.updateSchedule(_id, doc);
  },

  mastraScheduleRemove: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('schedulesRemove');
    requireUserId(user);
    return models.MastraSchedule.removeSchedule(_id);
  },

  mastraScheduleSetEnabled: async (
    _parent: undefined,
    { _id, isEnabled }: { _id: string; isEnabled: boolean },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('schedulesEdit');
    requireUserId(user);
    return models.MastraSchedule.setEnabled(_id, isEnabled);
  },

  // Manual fire. Allowed even when the schedule is disabled — disabling gates
  // the cron, not deliberate test runs (same contract as workflow run-start).
  mastraScheduleRunNow: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, subdomain, user, checkPermission }: IContext,
  ) => {
    await checkPermission('schedulesRun');
    requireUserId(user);
    const schedule = await models.MastraSchedule.getSchedule(_id);
    await runSchedule({ models, subdomain, schedule });
    return models.MastraSchedule.getSchedule(_id);
  },
};
