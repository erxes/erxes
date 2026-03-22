import {
  ActivityLogInput,
  activityBuilder,
  ActivityRule,
  assignmentRule,
  buildActivities,
  Config,
  fieldChangeRule,
  Resolver,
} from 'erxes-api-shared/core-modules';
import {
  ICustomerDocument,
  ICompanyDocument,
} from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';

const CUSTOMER_PRONOUN_LABELS: Record<string, string> = {
  '1': 'male',
  '2': 'female',
};

// Customer Activity Fields
const CUSTOMER_ACTIVITY_FIELDS = [
  { field: 'firstName', label: 'First Name' },
  { field: 'lastName', label: 'Last Name' },
  { field: 'middleName', label: 'Middle Name' },
  { field: 'primaryEmail', label: 'Primary Email' },
  { field: 'primaryPhone', label: 'Primary Phone' },
  { field: 'birthDate', label: 'Birth Date' },
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
];

const humanizeCustomerField = (field: string) =>
  field
    .replace(/\./g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getCustomerFieldLabel = (field: string) => {
  if (field.startsWith('links.')) {
    const [, key] = field.split('.');
    return `${humanizeCustomerField(key)} Link`;
  }

  const match = CUSTOMER_ACTIVITY_FIELDS.find((f) => f.field === field);
  return match?.label || humanizeCustomerField(field);
};

const getCustomerDisplayText = (doc: Partial<ICustomerDocument>) =>
  [doc.firstName, doc.middleName, doc.lastName].filter(Boolean).join(' ') ||
  doc.primaryEmail ||
  doc.primaryPhone ||
  (doc._id ? `Customer ${doc._id}` : 'this customer');

const buildCustomerTarget = (customer: ICustomerDocument | { _id: string }) => ({
  _id: customer._id,
  moduleName: 'contacts',
  collectionName: 'customers',
  text: getCustomerDisplayText(customer),
});

const buildCustomerFieldChangedActivity = (params: {
  customer: ICustomerDocument;
  field: string;
  prev: unknown;
  current: unknown;
  fieldLabel?: string;
  previousValueLabel?: string;
  currentValueLabel?: string;
}) => {
  const {
    customer,
    field,
    prev,
    current,
    fieldLabel,
    previousValueLabel,
    currentValueLabel,
  } = params;
  const resolvedFieldLabel = fieldLabel || getCustomerFieldLabel(field);

  return {
    activityType: 'customer.field_changed',
    target: buildCustomerTarget(customer),
    action: {
      type: 'customer.field_changed',
      description: `changed ${resolvedFieldLabel.toLowerCase()}`,
    },
    changes: {
      prev: { [field]: prev },
      current: { [field]: current },
    },
    metadata: {
      field,
      fieldLabel: resolvedFieldLabel,
      previousValueLabel,
      currentValueLabel,
    },
  };
};

const buildCustomerTagActivities = (params: {
  customer: ICustomerDocument;
  added: string[];
  removed: string[];
  addedLabels: string[];
  removedLabels: string[];
}) => {
  const { customer, added, removed, addedLabels, removedLabels } = params;
  const activities: ActivityLogInput[] = [];

  if (added.length) {
    activities.push({
      activityType: 'customer.tag_added',
      target: buildCustomerTarget(customer),
      context: {
        moduleName: 'tags',
        collectionName: 'tags',
        text: addedLabels.join(', '),
      },
      action: {
        type: 'customer.tag_added',
        description: 'added tag',
      },
      changes: {
        added: {
          ids: added,
          labels: addedLabels,
        },
      },
      metadata: {
        entityLabel: 'tag',
      },
    });
  }

  if (removed.length) {
    activities.push({
      activityType: 'customer.tag_removed',
      target: buildCustomerTarget(customer),
      context: {
        moduleName: 'tags',
        collectionName: 'tags',
        text: removedLabels.join(', '),
      },
      action: {
        type: 'customer.tag_removed',
        description: 'removed tag',
      },
      changes: {
        removed: {
          ids: removed,
          labels: removedLabels,
        },
      },
      metadata: {
        entityLabel: 'tag',
      },
    });
  }

  return activities;
};

type CustomerActivityContext = {
  customer: ICustomerDocument;
  models: IModels;
};

const customerActivityHandlers: Record<string, Resolver<ActivityLogInput>> = {
  $default: ({ field, prev, current }, ctx: CustomerActivityContext) => {
    if (!field) {
      return [];
    }

    return [
      buildCustomerFieldChangedActivity({
        customer: ctx.customer,
        field,
        prev,
        current,
      }),
    ];
  },

  sex: ({ field, prev, current }, ctx: CustomerActivityContext) => [
    buildCustomerFieldChangedActivity({
      customer: ctx.customer,
      field,
      prev,
      current,
      fieldLabel: 'Pronoun',
      previousValueLabel:
        prev === null || prev === undefined || prev === ''
          ? 'empty'
          : CUSTOMER_PRONOUN_LABELS[String(prev)] || String(prev),
      currentValueLabel:
        current === null || current === undefined || current === ''
          ? 'empty'
          : CUSTOMER_PRONOUN_LABELS[String(current)] || String(current),
    }),
  ],

  ownerId: async ({ field, prev, current }, ctx: CustomerActivityContext) => {
    const ids = [prev, current].filter(Boolean);
    const users = ids.length
      ? await ctx.models.Users.find({ _id: { $in: ids } }, {
          email: 1,
          'details.fullName': 1,
        }).lean()
      : [];

    const labelById = new Map(
      users.map((user: any) => [
        String(user._id),
        user?.details?.fullName || user?.email || 'unknown',
      ]),
    );

    return [
      buildCustomerFieldChangedActivity({
        customer: ctx.customer,
        field,
        prev,
        current,
        fieldLabel: 'Owner',
        previousValueLabel: prev ? labelById.get(String(prev)) || 'unknown' : 'empty',
        currentValueLabel: current
          ? labelById.get(String(current)) || 'unknown'
          : 'empty',
      }),
    ];
  },

  tagIds: async ({ added = [], removed = [] }, ctx: CustomerActivityContext) => {
    const [addedTags, removedTags] = await Promise.all([
      added.length
        ? ctx.models.Tags.find({ _id: { $in: added } }, { name: 1 }).lean()
        : Promise.resolve([]),
      removed.length
        ? ctx.models.Tags.find({ _id: { $in: removed } }, { name: 1 }).lean()
        : Promise.resolve([]),
    ]);

    return buildCustomerTagActivities({
      customer: ctx.customer,
      added,
      removed,
      addedLabels: addedTags.map((tag: any) => tag.name),
      removedLabels: removedTags.map((tag: any) => tag.name),
    });
  },
};

const CUSTOMER_ACTIVITY_CONFIG: Config<ActivityLogInput> = {
  assignmentFields: ['tagIds'],
  commonFields: [
    ...CUSTOMER_ACTIVITY_FIELDS.map(({ field }) => field),
    'sex',
    'ownerId',
    'links.*',
  ],
  resolvers: customerActivityHandlers,
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
  const activities = await activityBuilder(
    prevDocument,
    currentDocument,
    CUSTOMER_ACTIVITY_CONFIG,
    {
      customer: currentDocument,
      models,
    },
  );

  if (activities.length > 0) {
    createActivityLog(activities);
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

const getCompanyDisplayText = (doc: Partial<ICompanyDocument>) =>
  doc.primaryName ||
  doc.primaryEmail ||
  doc.primaryPhone ||
  (doc._id ? `Company ${doc._id}` : 'this company');

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
          moduleName: 'contacts',
          collectionName: 'companies',
          text: getCompanyDisplayText(currentDocument),
        },
        pluginName: 'core',
        moduleName: 'contacts',
        collectionName: 'companies',
      })),
    );
  }
}
