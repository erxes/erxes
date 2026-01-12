import {
  ActivityLogInput,
  ActivityRule,
  assignmentRule,
  buildActivities,
  fieldChangeRule,
} from 'erxes-api-shared/core-modules';
import { IProductDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';

// Product Activity Fields
const PRODUCT_ACTIVITY_FIELDS = [
  { field: 'name', label: 'Name' },
  { field: 'shortName', label: 'Short Name' },
  { field: 'description', label: 'Description' },
  { field: 'code', label: 'Code' },
  { field: 'unitPrice', label: 'Unit Price' },
  { field: 'status', label: 'Status' },
  { field: 'type', label: 'Type' },
  { field: 'currency', label: 'Currency' },
  { field: 'barcodeDescription', label: 'Barcode Description' },
];

const getProductFieldLabel = (field: string) => {
  const match = PRODUCT_ACTIVITY_FIELDS.find((f) => f.field === field);
  const { label = 'unknown' } = match || {};
  return label;
};

/**
 * Generate activity logs for product changes
 */
export async function generateProductActivityLogs(
  prevDocument: IProductDocument,
  currentDocument: IProductDocument,
  models: IModels,
  createActivityLog: (
    activities: ActivityLogInput | ActivityLogInput[],
  ) => void,
): Promise<void> {
  const activityRegistry: ActivityRule[] = [
    fieldChangeRule(
      PRODUCT_ACTIVITY_FIELDS.map(({ field }) => field),
      'updated',
      getProductFieldLabel,
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
        moduleName: 'products',
        collectionName: 'products',
      })),
    );
  }
}
