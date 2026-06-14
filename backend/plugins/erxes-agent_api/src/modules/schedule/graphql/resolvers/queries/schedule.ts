import { IUserDocument } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { IMastraScheduleDocument } from '@/schedule/@types/schedule';
import { scheduleThreadId } from '~/mastra/schedules/runner';

/** Resolve the logged-in user's _id, rejecting unauthenticated calls. */
const requireUserId = (user: IUserDocument | null | undefined): string => {
  const userId = user?._id;
  if (!userId) throw new Error('Login required');
  return userId;
};

/** Queries over scheduled agent runs. */
export const scheduleQueries = {
  mastraSchedules: (
    _parent: undefined,
    _args: undefined,
    { models, user }: IContext,
  ) => {
    requireUserId(user);
    return models.MastraSchedule.getSchedules();
  },

  mastraSchedule: (
    _parent: undefined,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) => {
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
