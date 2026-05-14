import {
  ActivityLogInput,
  ActivityRule,
  buildActivities,
  fieldChangeRule,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { getFieldLabel } from './common';

const BOARD_ACTIVITY_FIELDS = [
  { field: 'name', label: 'Name' },
  { field: 'type', label: 'Type' },
  { field: 'order', label: 'Order' },
];

export async function generateBoardActivityLogs(
  prevDocument: any,
  currentDocument: any,
  models: IModels,
  createActivityLog: (
    activities: ActivityLogInput | ActivityLogInput[],
  ) => void,
): Promise<void> {
  const activityRegistry: ActivityRule[] = [
    fieldChangeRule(
      BOARD_ACTIVITY_FIELDS.map(({ field }) => field),
      'updated',
      (field) => getFieldLabel(field, BOARD_ACTIVITY_FIELDS),
    ),
    fieldChangeRule(
      ['status'],
      'set',
      (field: string, { current }: { current: any; prev: any }) =>
        current === 'archived' ? 'Archived' : 'Active',
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
          moduleName: 'sales',
          collectionName: 'boards',
        },
      })),
    );
  }
}
