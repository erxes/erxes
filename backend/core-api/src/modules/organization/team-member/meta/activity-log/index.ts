import {
  Config,
  ActivityLogInput,
  activityBuilder,
} from 'erxes-api-shared/core-modules';
import { USER_ACTIVITY_FIELDS } from './constants';
import { userActivityResolvers } from './resolvers';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';

const USER_ACTIVITY_CONFIG: Config<ActivityLogInput> = {
  assignmentFields: ['branchIds', 'departmentIds', 'positionIds'],
  commonFields: [
    ...USER_ACTIVITY_FIELDS.map(({ field }) => field),
    'isActive',
    'role',
    'links.*',
  ],
  resolvers: userActivityResolvers,
};

export async function generateUserActivityLogs(
  prevDocument: IUserDocument,
  currentDocument: IUserDocument,
  models: IModels,
  createActivityLog: (
    activities: ActivityLogInput | ActivityLogInput[],
  ) => void,
): Promise<void> {
  const activities = await activityBuilder(
    prevDocument,
    currentDocument,
    USER_ACTIVITY_CONFIG,
    {
      user: currentDocument,
      models,
    },
  );

  if (activities.length) {
    createActivityLog(activities);
  }
}
