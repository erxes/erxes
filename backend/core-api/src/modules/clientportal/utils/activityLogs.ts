import {
  ActivityLogInput,
  ActivityRule,
  buildActivities,
  fieldChangeRule,
} from 'erxes-api-shared/core-modules';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { ICPUserDocument } from '@/clientportal/types/cpUser';

const CP_USER_ACTIVITY_TARGET_TYPE = 'core:clientportal.cpUser';

type CPUserLoginMethod = 'credentials' | 'otp' | 'social';

interface CPUserLoginActivityPayload {
  activityType: string;
  target: { _id: string };
  action: { type: string; description: string };
  changes: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// CP User Activity Fields (editable fields that show in "updated" logs)
const CP_USER_ACTIVITY_FIELDS = [
  { field: 'firstName', label: 'First Name' },
  { field: 'lastName', label: 'Last Name' },
  { field: 'email', label: 'Email' },
  { field: 'phone', label: 'Phone' },
  { field: 'username', label: 'Username' },
  { field: 'companyName', label: 'Company Name' },
  { field: 'companyRegistrationNumber', label: 'Company Registration Number' },
  { field: 'avatar', label: 'Avatar' },
];

const getCPUserFieldLabel = (field: string) => {
  const match = CP_USER_ACTIVITY_FIELDS.find((f) => f.field === field);
  const { label = 'unknown' } = match || {};
  return label;
};

/**
 * Generate activity log for CP user creation
 */
export function generateCPUserCreatedActivityLog(
  user: ICPUserDocument | { _id: string },
): ActivityLogInput {
  return {
    activityType: 'create',
    target: { _id: user._id },
    action: {
      type: 'create',
      description: 'Client portal user created',
    },
    changes: {},
  };
}

/**
 * Generate activity logs for CP user changes (mirror generateCustomerActivityLogs)
 */
export async function generateCPUserActivityLogs(
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

/**
 * Generate activity log for CP user removal
 */
export function generateCPUserRemovedActivityLog(
  user: ICPUserDocument | { _id: string },
): ActivityLogInput {
  return {
    activityType: 'remove',
    target: { _id: user._id },
    action: {
      type: 'remove',
      description: 'Client portal user removed',
    },
    changes: {},
  };
}

/**
 * Generate activity log payload for CP user login
 */
export function generateCPUserLoginActivityLog(
  cpUser: ICPUserDocument | { _id: string },
  method: CPUserLoginMethod,
): CPUserLoginActivityPayload {
  const loginTime = new Date();
  const changes = {
    loginTime,
    method,
  };
  return {
    activityType: 'login',
    target: { _id: cpUser._id },
    action: {
      type: 'login',
      description: 'Client portal user logged in',
    },
    changes,
    metadata: { ...changes },
  };
}

/**
 * Generate activity log payload for CP user logout
 */
export function generateCPUserLogoutActivityLog(
  cpUser: ICPUserDocument | { _id: string },
): CPUserLoginActivityPayload {
  const logoutTime = new Date();
  return {
    activityType: 'logout',
    target: { _id: cpUser._id },
    action: {
      type: 'logout',
      description: 'Client portal user logged out',
    },
    changes: { logoutTime },
    metadata: { logoutTime },
  };
}

function sanitizeCPUserForActor(
  cpUser: ICPUserDocument | { _id: string } | Record<string, unknown>,
): Record<string, unknown> {
  const doc = cpUser && typeof cpUser === 'object' ? cpUser : {};
  return {
    _id: (doc as { _id?: string })._id,
    email: (doc as { email?: string }).email,
    username: (doc as { username?: string }).username,
    firstName: (doc as { firstName?: string }).firstName,
    lastName: (doc as { lastName?: string }).lastName,
    clientPortalId: (doc as { clientPortalId?: string }).clientPortalId,
  };
}

/**
 * Create CP user activity log (login/logout) and publish for real-time UI
 */
export async function createCPUserActivityLog(
  models: IModels,
  subdomain: string,
  payload: CPUserLoginActivityPayload,
  cpUser: ICPUserDocument | { _id: string } | Record<string, unknown>,
): Promise<void> {
  const { activityType, target, action, changes, metadata } = payload;
  const targetId = target?._id;
  if (!targetId) return;

  const actor = sanitizeCPUserForActor(cpUser);

  const activityLog = await models.ActivityLogs.create({
    activityType,
    targetId,
    targetType: CP_USER_ACTIVITY_TARGET_TYPE,
    target: { _id: targetId },
    action,
    changes: changes || {},
    metadata: metadata || {},
    actorType: 'cpUser',
    actor,
  });

  graphqlPubsub.publish(`activityLogInserted:${subdomain}:${targetId}`, {
    activityLogInserted: activityLog.toObject(),
  });
}
