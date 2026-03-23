import {
  ActivityLogInput,
  ActivityRule,
  buildActivities,
  fieldChangeRule,
} from 'erxes-api-shared/core-modules';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import {
  CP_USER_ACTIVITY_FIELDS,
  CP_USER_ACTIVITY_TARGET_TYPE,
} from './constants';
import {
  generateCPUserCreatedActivityLog,
  generateCPUserLoginActivityLog,
  generateCPUserLogoutActivityLog,
  generateCPUserRemovedActivityLog,
} from './builders';
import type { CPUserLoginActivityPayload } from './types';
import { getCPUserFieldLabel, sanitizeCPUserForActor } from './utils';

export async function generateCPUserUpdateActivityLogs(
  prevDocument: ICPUserDocument | Record<string, any>,
  currentDocument: ICPUserDocument | Record<string, any>,
  models: IModels,
  createActivityLog: (
    activities: ActivityLogInput | ActivityLogInput[],
  ) => void,
): Promise<void> {
  const activityRegistry: ActivityRule[] = [
    fieldChangeRule(
      CP_USER_ACTIVITY_FIELDS.map(({ field }) => field),
      'updated',
      getCPUserFieldLabel,
    ),
  ];

  const activities = await buildActivities(
    prevDocument,
    currentDocument,
    activityRegistry,
  );

  if (activities.length > 0) {
    createActivityLog(
      activities.map((activity) => ({
        ...activity,
        changes: activity.changes || {},
        target: {
          _id: currentDocument._id,
        },
        pluginName: 'core',
        moduleName: 'clientportal',
        collectionName: 'cpUser',
      })),
    );
  }
}

export async function createCPUserActivityLog(
  models: IModels,
  subdomain: string,
  payload: CPUserLoginActivityPayload,
  cpUser: ICPUserDocument | { _id: string } | Record<string, unknown>,
): Promise<void> {
  const { activityType, target, action, changes, metadata } = payload;
  const targetId = target?._id;

  if (!targetId) {
    return;
  }

  const actor = sanitizeCPUserForActor(cpUser);

  await models.ActivityLogs.createActivityLog(subdomain, {
    activityType,
    targetType: CP_USER_ACTIVITY_TARGET_TYPE,
    target: { _id: targetId },
    action,
    changes: changes || {},
    metadata: metadata || {},
    actorType: 'cpUser',
    actor,
  });
}

export {
  generateCPUserCreatedActivityLog,
  generateCPUserLoginActivityLog,
  generateCPUserLogoutActivityLog,
  generateCPUserRemovedActivityLog,
};
