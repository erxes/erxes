import { IUserDocument } from 'erxes-api-shared/core-types';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IMastraScheduleDocument } from '@/schedule/@types/schedule';
import { scheduleThreadId } from '~/mastra/schedules/runner';

/** Resolve the logged-in user's _id, rejecting unauthenticated calls. */
const requireUserId = (user: IUserDocument | null | undefined): string => {
  const userId = user?._id;
  if (!userId) throw new ExpectedError('Login required');
  return userId;
};

/** Queries over scheduled agent runs. */
export const scheduleQueries = {
  mastraSchedules: async (
    _parent: undefined,
    _args: undefined,
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('schedulesView');
    requireUserId(user);
    return models.MastraSchedule.getSchedules();
  },

  mastraSchedule: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('schedulesView');
    requireUserId(user);
    return models.MastraSchedule.getSchedule(_id);
  },
};

/** Field resolvers — threadId is derived, never stored. */
export const scheduleCustomResolvers = {
  MastraSchedule: {
    threadId: (schedule: IMastraScheduleDocument) =>
      scheduleThreadId(schedule._id),
  },
};
