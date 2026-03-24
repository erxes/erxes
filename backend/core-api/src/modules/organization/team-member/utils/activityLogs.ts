import {
  ActivityLogInput,
  ActivityRule,
  assignmentRule,
  buildActivities,
  fieldChangeRule,
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
];

const getFieldLabel = (field: string) => {
  const match = USER_ACTIVITY_FIELDS.find((f) => f.field === field);

  const { label = 'unknown' } = match || {};
  return label;
};

/**
 * Generate activity logs for all changed activity fields
 */
export async function generateUserActivityLogs(
  prevDocument: IUserDocument,
  currentDocument: IUserDocument,
  models: IModels,
  createActivityLog: (
    activities: ActivityLogInput | ActivityLogInput[],
  ) => void,
): Promise<void> {
  const activityRegistry: ActivityRule[] = [
    fieldChangeRule(
      USER_ACTIVITY_FIELDS.map(({ field }) => field),
      'updated',
      getFieldLabel,
    ),
    fieldChangeRule(['isActive'], 'set', (_, current) =>
      current ? 'Active' : 'Inactive',
    ),
    fieldChangeRule(['links.*'], 'set', (field) => {
      const [, key] = field.split('.');
      return `${key} link`;
    }),
    assignmentRule('branchIds', async (ids: string[]) => {
      const branches = await models.Branches.find(
        { _id: { $in: ids } },
        { title: 1 },
      ).lean();
      return branches.map((branch) => branch.title);
    }),
    assignmentRule('departmentIds', async (ids: string[]) => {
      const departments = await models.Departments.find(
        { _id: { $in: ids } },
        { title: 1 },
      ).lean();
      return departments.map((department) => department.title);
    }),
    assignmentRule('positionIds', async (ids: string[]) => {
      const positions = await models.Positions.find(
        { _id: { $in: ids } },
        { title: 1 },
      ).lean();
      return positions.map((position) => position.title);
    }),
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
      })),
    );
  }
}
/**
 * Generate activity log for user login
 */
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
    activityType: 'login',
    target: {
      _id: user._id,
    },
    action: {
      type: 'login',
      description: 'User logged in',
    },
    changes: changes,
    metadata: {
      ...metadata,
      ...changes,
    },
    pluginName: 'core',
    moduleName: 'organization',
    collectionName: 'users',
  };
}

/**
 * Generate activity log for user logout
 */
export function generateLogoutActivityLog(
  user: IUserDocument,
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  },
) {
  return {
    activityType: 'logout',
    target: {
      _id: user._id,
    },
    action: {
      type: 'logout',
      description: 'User logged out',
    },
    changes: {
      logoutTime: new Date(),
    },
    metadata: {
      logoutTime: new Date(),
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    },
    pluginName: 'core',
    moduleName: 'organization',
    collectionName: 'users',
  };
}

export const generateUserInvitationActivityLog = (user: IUserDocument) => ({
  activityType: 'invite',
  target: {
    _id: user._id,
  },
  action: {
    type: 'invite',
    description: 'User invited',
  },
  changes: {
    email: user.email,
  },
  pluginName: 'core',
  moduleName: 'organization',
  collectionName: 'users',
});
