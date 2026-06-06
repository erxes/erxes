import {
  Config,
  ActivityLogInput,
  activityBuilder,
} from 'erxes-api-shared/core-modules';
import { USER_ACTIVITY_FIELDS } from './constants';
import { userActivityResolvers } from './resolvers';
import { buildTarget } from './utils';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';

const USER_ACTIVITY_CONFIG: Config<ActivityLogInput> = {
  assignmentFields: [
    'branchIds',
    'departmentIds',
    'positionIds',
    'permissionGroupIds',
  ],
  commonFields: [
    ...USER_ACTIVITY_FIELDS.map(({ field }) => field),
    'isActive',
    'role',
    'links.*',
    'customPermissions',
  ],
  resolvers: userActivityResolvers,
  buildTarget: (document) => buildTarget(document),
};

export async function generateUserUpdateActivityLogs(
  context: { models: IModels; subdomain: string },

  prevDocument: IUserDocument,
  currentDocument: IUserDocument,
  createActivityLog: (
    activities: ActivityLogInput | ActivityLogInput[],
  ) => void,
): Promise<void> {
  const activities = await activityBuilder(
    prevDocument,
    currentDocument,
    USER_ACTIVITY_CONFIG,
    { ...context, target: currentDocument },
  );

  if (activities.length) {
    createActivityLog(activities);
  }
}

export {
  generateLoginActivityLog,
  generateLogoutActivityLog,
  generateUserInvitationActivityLog,
} from './builders';
