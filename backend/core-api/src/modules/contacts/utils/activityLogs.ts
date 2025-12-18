import {
  ActivityLogInput,
  ActivityRule,
  assignmentRule,
  buildActivities,
  fieldChangeRule,
} from 'erxes-api-shared/core-modules';
import {
  ICustomerDocument,
  ICompanyDocument,
} from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';

// Customer Activity Fields
const CUSTOMER_ACTIVITY_FIELDS = [
  { field: 'firstName', label: 'First Name' },
  { field: 'lastName', label: 'Last Name' },
  { field: 'middleName', label: 'Middle Name' },
  { field: 'primaryEmail', label: 'Primary Email' },
  { field: 'primaryPhone', label: 'Primary Phone' },
  { field: 'birthDate', label: 'Birth Date' },
  { field: 'sex', label: 'Pronoun' },
  { field: 'position', label: 'Position' },
  { field: 'department', label: 'Department' },
  { field: 'leadStatus', label: 'Lead Status' },
  { field: 'hasAuthority', label: 'Has Authority' },
  { field: 'description', label: 'Description' },
  { field: 'doNotDisturb', label: 'Do Not Disturb' },
  { field: 'isSubscribed', label: 'Subscription Status' },
  { field: 'emailValidationStatus', label: 'Email Validation Status' },
  { field: 'phoneValidationStatus', label: 'Phone Validation Status' },
  { field: 'status', label: 'Status' },
  { field: 'code', label: 'Code' },
  { field: 'state', label: 'State' },
  { field: 'phones', label: 'Phones' },
  { field: 'emails', label: 'Emails' },
  { field: 'code', label: 'Code' },
  { field: 'state', label: 'State' },
];

const getCustomerFieldLabel = (field: string) => {
  const match = CUSTOMER_ACTIVITY_FIELDS.find((f) => f.field === field);
  const { label = 'unknown' } = match || {};
  return label;
};

/**
 * Generate activity logs for customer changes
 */
export async function generateCustomerActivityLogs(
  prevDocument: ICustomerDocument,
  currentDocument: ICustomerDocument,
  models: IModels,
  createActivityLog: (
    activities: ActivityLogInput | ActivityLogInput[],
  ) => void,
): Promise<void> {
  const activityRegistry: ActivityRule[] = [
    fieldChangeRule(
      CUSTOMER_ACTIVITY_FIELDS.map(({ field }) => field),
      'updated',
      getCustomerFieldLabel,
    ),
    fieldChangeRule(['state'], 'set', (_, { current }) => {
      return current || 'unknown';
    }),
    fieldChangeRule(['links.*'], 'set', (field) => {
      const [, key] = field.split('.');
      return `${key} link`;
    }),
    fieldChangeRule(
      ['ownerId'],
      'set',
      () => 'Owner',
      async (id) => {
        const user = await models.Users.findOne({ _id: id }).lean();
        const result = user?.details?.fullName || user?.email || 'unknown';
        console.log('result', result);
        return result;
      },
    ),
    assignmentRule('tagIds', async (ids: string[]) => {
      const tags = await models.Tags.find(
        { _id: { $in: ids } },
        { name: 1 },
      ).lean();
      return tags.map((tag) => tag.name);
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
        pluginName: 'core',
        moduleName: 'contacts',
        collectionName: 'customers',
      })),
    );
  }
}

// Company Activity Fields
const COMPANY_ACTIVITY_FIELDS = [
  { field: 'primaryName', label: 'Primary Name' },
  { field: 'primaryEmail', label: 'Primary Email' },
  { field: 'primaryPhone', label: 'Primary Phone' },
  { field: 'website', label: 'Website' },
  { field: 'industry', label: 'Industry' },
  { field: 'plan', label: 'Plan' },
  { field: 'size', label: 'Size' },
  { field: 'employees', label: 'Employees' },
  { field: 'businessType', label: 'Business Type' },
  { field: 'description', label: 'Description' },
  { field: 'isSubscribed', label: 'Subscription Status' },
  { field: 'status', label: 'Status' },
  { field: 'code', label: 'Code' },
  { field: 'location', label: 'Location' },
];

const getCompanyFieldLabel = (field: string) => {
  const match = COMPANY_ACTIVITY_FIELDS.find((f) => f.field === field);
  const { label = 'unknown' } = match || {};
  return label;
};

/**
 * Generate activity logs for company changes
 */
export async function generateCompanyActivityLogs(
  prevDocument: ICompanyDocument,
  currentDocument: ICompanyDocument,
  models: IModels,
  createActivityLog: (
    activities: ActivityLogInput | ActivityLogInput[],
  ) => void,
): Promise<void> {
  const activityRegistry: ActivityRule[] = [
    fieldChangeRule(
      COMPANY_ACTIVITY_FIELDS.map(({ field }) => field),
      'updated',
      getCompanyFieldLabel,
    ),
    fieldChangeRule(['links.*'], 'set', (field) => {
      const [, key] = field.split('.');
      return `${key} link`;
    }),
    assignmentRule('tagIds', async (ids: string[]) => {
      const tags = await models.Tags.find(
        { _id: { $in: ids } },
        { name: 1 },
      ).lean();
      return tags.map((tag) => tag.name);
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
        pluginName: 'core',
        moduleName: 'contacts',
        collectionName: 'companies',
      })),
    );
  }
}
