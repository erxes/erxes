import { IUserDocument } from 'erxes-api-shared/core-types';
import { buildTarget, getFieldLabel } from './utils';
import {
  activityBuilder,
  ActivityLogInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

export const buildUserFieldChangedActivity = (params: {
  user: IUserDocument;
  field: string;
  prev: unknown;
  current: unknown;
}): ActivityLogInput => {
  const { user, field, prev, current } = params;
  const fieldLabel = getFieldLabel(field);

  return {
    activityType: 'user.field_changed',
    target: buildTarget(user),
    action: {
      type: 'user.field_changed',
      description: `${fieldLabel} changed`,
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
    description: 'User activated',
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
    description: 'User deactivated',
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
      description: 'User role changed',
    },
    changes: {
      prev: { role: prevRole },
      current: { role: currentRole },
    },
  };
};

export const buildUserAssignmentActivities = (params: {
  user: IUserDocument;
  field: 'branchIds' | 'departmentIds' | 'positionIds';
  added: string[];
  removed: string[];
  addedLabels: string[];
  removedLabels: string[];
}): ActivityLogInput[] => {
  const { user, field, added, removed, addedLabels, removedLabels } = params;
  const entityLabel = field.replace(/Ids$/, '');
  const activities: ActivityLogInput[] = [];

  if (added.length) {
    activities.push({
      activityType: `user.${entityLabel}_assigned`,
      target: buildTarget(user),
      action: {
        type: `user.${entityLabel}_assigned`,
        description: `${entityLabel} assigned`,
      },
      changes: {
        added: {
          ids: added,
          labels: addedLabels,
        },
      },
      metadata: { field },
    });
  }

  if (removed.length) {
    activities.push({
      activityType: `user.${entityLabel}_unassigned`,
      target: buildTarget(user),
      action: {
        type: `user.${entityLabel}_unassigned`,
        description: `${entityLabel} unassigned`,
      },
      changes: {
        removed: {
          ids: removed,
          labels: removedLabels,
        },
      },
      metadata: { field },
    });
  }

  return activities;
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
      description: 'User logged in',
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
      description: 'User logged out',
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
    description: 'User invited',
  },
  changes: {
    email: user.email,
  },
});
