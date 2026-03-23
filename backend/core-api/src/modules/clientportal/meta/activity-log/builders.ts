import { ActivityLogInput } from 'erxes-api-shared/core-modules';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import type {
  CPUserLoginActivityPayload,
  CPUserLoginMethod,
} from './types';

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

export function generateCPUserLoginActivityLog(
  cpUser: ICPUserDocument | { _id: string },
  method: CPUserLoginMethod,
): CPUserLoginActivityPayload {
  const loginTime = new Date();
  const changes = { loginTime, method };

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
