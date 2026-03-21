import {
  ActivityLogInput,
  activityBuilder,
  Config,
  Resolver,
} from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';

const USER_ACTIVITY_FIELDS = [
  { field: 'email', label: 'Email' },
  { field: 'code', label: 'Code' },
  { field: 'username', label: 'Username' },
  { field: 'employeeId', label: 'Employee Id' },
  { field: 'details.firstName', label: 'First Name' },
  { field: 'details.lastName', label: 'Last Name' },
  { field: 'details.email', label: 'Email' },
  { field: 'details.phone', label: 'Phone' },
  { field: 'details.address', label: 'Address' },
  { field: 'details.city', label: 'City' },
  { field: 'details.state', label: 'State' },
  { field: 'details.birthDate', label: 'Birth Date' },
  { field: 'details.workStartedDate', label: 'Work Started Date' },
  { field: 'details.location', label: 'Location' },
  { field: 'details.description', label: 'Description' },
  { field: 'details.operatorPhone', label: 'Operator Phone' },
  { field: 'details.position', label: 'Position' },
  { field: 'details.shortName', label: 'Short Name' },
] as const;

const getFieldLabel = (field: string) => {
  if (field.startsWith('links.')) {
    const [, key] = field.split('.');
    return `${key} link`;
  }

  const match = USER_ACTIVITY_FIELDS.find((item) => item.field === field);
  return match?.label || field;
};

const buildTarget = (user: IUserDocument | { _id: string }) => ({
  _id: user._id,
});

const buildUserFieldChangedActivity = (params: {
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

const buildUserActivatedActivity = (user: IUserDocument): ActivityLogInput => ({
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

const buildUserDeactivatedActivity = (
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

const buildUserRoleChangedActivity = (params: {
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

const buildUserAssignmentActivities = (params: {
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

type UserActivityContext = {
  user: IUserDocument;
  models: IModels;
};

const userActivityHandlers: Record<string, Resolver<ActivityLogInput>> = {
  $default: ({ field, prev, current }, ctx: UserActivityContext) => {
    if (field == null) {
      return [];
    }

    return [
      buildUserFieldChangedActivity({
        user: ctx.user,
        field,
        prev,
        current,
      }),
    ];
  },

  isActive: ({ current }, ctx: UserActivityContext) =>
    current
      ? [buildUserActivatedActivity(ctx.user)]
      : [buildUserDeactivatedActivity(ctx.user)],

  role: ({ prev, current }, ctx: UserActivityContext) => [
    buildUserRoleChangedActivity({
      user: ctx.user,
      prevRole: prev,
      currentRole: current,
    }),
  ],

  branchIds: async ({ added = [], removed = [] }, ctx: UserActivityContext) => {
    const [addedLabels, removedLabels] = await Promise.all([
      added.length
        ? ctx.models.Branches.find({ _id: { $in: added } }, { title: 1 }).lean()
        : Promise.resolve([]),
      removed.length
        ? ctx.models.Branches.find(
            { _id: { $in: removed } },
            { title: 1 },
          ).lean()
        : Promise.resolve([]),
    ]);

    return buildUserAssignmentActivities({
      user: ctx.user,
      field: 'branchIds',
      added,
      removed,
      addedLabels: addedLabels.map((branch: any) => branch.title),
      removedLabels: removedLabels.map((branch: any) => branch.title),
    });
  },

  departmentIds: async (
    { added = [], removed = [] },
    ctx: UserActivityContext,
  ) => {
    const [addedLabels, removedLabels] = await Promise.all([
      added.length
        ? ctx.models.Departments.find(
            { _id: { $in: added } },
            { title: 1 },
          ).lean()
        : Promise.resolve([]),
      removed.length
        ? ctx.models.Departments.find(
            { _id: { $in: removed } },
            { title: 1 },
          ).lean()
        : Promise.resolve([]),
    ]);

    return buildUserAssignmentActivities({
      user: ctx.user,
      field: 'departmentIds',
      added,
      removed,
      addedLabels: addedLabels.map((department: any) => department.title),
      removedLabels: removedLabels.map((department: any) => department.title),
    });
  },

  positionIds: async (
    { added = [], removed = [] },
    ctx: UserActivityContext,
  ) => {
    const [addedLabels, removedLabels] = await Promise.all([
      added.length
        ? ctx.models.Positions.find(
            { _id: { $in: added } },
            { title: 1 },
          ).lean()
        : Promise.resolve([]),
      removed.length
        ? ctx.models.Positions.find(
            { _id: { $in: removed } },
            { title: 1 },
          ).lean()
        : Promise.resolve([]),
    ]);

    return buildUserAssignmentActivities({
      user: ctx.user,
      field: 'positionIds',
      added,
      removed,
      addedLabels: addedLabels.map((position: any) => position.title),
      removedLabels: removedLabels.map((position: any) => position.title),
    });
  },
};

const USER_ACTIVITY_CONFIG: Config<ActivityLogInput> = {
  assignmentFields: ['branchIds', 'departmentIds', 'positionIds'],
  commonFields: [
    ...USER_ACTIVITY_FIELDS.map(({ field }) => field),
    'isActive',
    'role',
    'links.*',
  ],
  resolvers: userActivityHandlers,
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
  console.log({ activities });

  if (activities.length) {
    createActivityLog(activities);
  }
}

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
