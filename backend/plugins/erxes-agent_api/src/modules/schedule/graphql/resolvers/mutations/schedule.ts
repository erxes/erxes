import { IUserDocument } from 'erxes-api-shared/core-types';
import { IContext, IModels } from '~/connectionResolvers';
import { IMastraSchedule } from '@/schedule/@types/schedule';
import { runSchedule } from '~/mastra/schedules/runner';

/** Resolve the logged-in user's _id, rejecting unauthenticated calls. */
const requireUserId = (user: IUserDocument | null | undefined): string => {
  const userId = user?._id;
  if (!userId) throw new Error('Login required');
  return userId;
};

/** The referenced agent must exist and be enabled before a schedule saves. */
const assertAgentRunnable = async (models: IModels, agentId: unknown) => {
  if (typeof agentId !== 'string' || !agentId) {
    throw new Error('agentId must be a non-empty string');
  }
  const agent = await models.MastraAgent.findOne({ agentId, isEnabled: true });
  if (!agent) throw new Error(`Agent "${agentId}" not found or disabled`);
};

/** Mutations for scheduled agent runs. */
export const scheduleMutations = {
  mastraScheduleCreate: async (
    _parent: undefined,
    { doc }: { doc: IMastraSchedule },
    { models, user }: IContext,
  ) => {
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
    { models, user }: IContext,
  ) => {
    requireUserId(user);
    if (doc.agentId !== undefined) {
      await assertAgentRunnable(models, doc.agentId);
    }
    return models.MastraSchedule.updateSchedule(_id, doc);
  },

  mastraScheduleRemove: (
    _parent: undefined,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) => {
    requireUserId(user);
    return models.MastraSchedule.removeSchedule(_id);
  },

  mastraScheduleSetEnabled: (
    _parent: undefined,
    { _id, isEnabled }: { _id: string; isEnabled: boolean },
    { models, user }: IContext,
  ) => {
    requireUserId(user);
    return models.MastraSchedule.setEnabled(_id, isEnabled);
  },

  // Manual fire. Allowed even when the schedule is disabled — disabling gates
  // the cron, not deliberate test runs (same contract as workflow run-start).
  mastraScheduleRunNow: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, subdomain, user }: IContext,
  ) => {
    requireUserId(user);
    const schedule = await models.MastraSchedule.getSchedule(_id);
    await runSchedule({ models, subdomain, schedule });
    return models.MastraSchedule.getSchedule(_id);
  },
};
