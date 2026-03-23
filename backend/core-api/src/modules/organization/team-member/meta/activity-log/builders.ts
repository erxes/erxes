import { IUserDocument } from 'erxes-api-shared/core-types';
import { buildTarget, getFieldLabel } from './utils';
import { ActivityLogInput } from 'erxes-api-shared/core-modules';

export const buildUserFieldChangedActivity = (params: {
  user: IUserDocument;
  field: string;
  prev: unknown;
  current: unknown;
}): ActivityLogInput => {
  const { user, field, prev, current } = params;

  if (!user) {
    throw new Error(
      'User is required for building user field changed activity',
    );
  }

  const fieldLabel = getFieldLabel(field);

  return {
    activityType: 'user.field_changed',
    target: buildTarget(user),
    action: {
      type: 'user.field_changed',
      description: `changed ${fieldLabel.toLowerCase()}`,
    },
    changes: {
      prev: { [field]: prev },
      current: { [field]: current },
    },
    metadata: {
      field,
      fieldLabel,
    },
  };
};

export const buildUserActivatedActivity = (
  user: IUserDocument,
): ActivityLogInput => ({
  activityType: 'user.activated',
  target: buildTarget(user),
  action: {
    type: 'user.activated',
    description: 'activated this member',
  },
  changes: {
    prev: { isActive: false },
    current: { isActive: true },
  },
});

export const buildUserDeactivatedActivity = (
  user: IUserDocument,
): ActivityLogInput => ({
  activityType: 'user.deactivated',
  target: buildTarget(user),
  action: {
    type: 'user.deactivated',
    description: 'deactivated this member',
  },
  changes: {
    prev: { isActive: true },
    current: { isActive: false },
  },
});

export const buildUserRoleChangedActivity = (params: {
  user: IUserDocument;
  prevRole: unknown;
  currentRole: unknown;
}): ActivityLogInput => {
  const { user, prevRole, currentRole } = params;

  return {
    activityType: 'user.role_changed',
    target: buildTarget(user),
    action: {
      type: 'user.role_changed',
      description: 'changed role',
    },
    changes: {
      prev: { role: prevRole },
      current: { role: currentRole },
    },
  };
};

export function generateLoginActivityLog(
  user: IUserDocument,
  metadata?: {
    method?: string;
    deviceToken?: string;
    ipAddress?: string;
    userAgent?: string;
  },
) {
  const changes = {
    loginTime: new Date(),
    method: metadata?.method || 'email/password',
  };

  return {
    activityType: 'user.logged_in',
    target: buildTarget(user),
    action: {
      type: 'user.logged_in',
      description: 'signed in',
    },
    changes,
    metadata: {
      ...metadata,
      ...changes,
    },
  };
}

export function generateLogoutActivityLog(
  user: IUserDocument,
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  },
) {
  const logoutTime = new Date();

  return {
    activityType: 'user.logged_out',
    target: buildTarget(user),
    action: {
      type: 'user.logged_out',
      description: 'signed out',
    },
    changes: {
      logoutTime,
    },
    metadata: {
      logoutTime,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    },
  };
}

export const generateUserInvitationActivityLog = (user: IUserDocument) => ({
  activityType: 'user.invited',
  target: buildTarget(user),
  action: {
    type: 'user.invited',
    description: 'invited a member',
  },
  metadata: {
    invitedEmail: user.email,
  },
  changes: {
    email: user.email,
  },
});
