import {
  ActivityLogInput,
  ActivityRule,
  buildActivities,
  fieldChangeRule,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { ICPUserDocument } from '@/clientportal/types/cpUser';

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
