import {
  ActivityLogInput,
  ActivityRule,
  assignmentRule,
  buildActivities,
  fieldChangeRule,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { fetchUsersByIds, getFieldLabel } from './common';

const STAGE_ACTIVITY_FIELDS = [
  { field: 'name', label: 'Name' },
  { field: 'type', label: 'Type' },
  { field: 'pipelineId', label: 'Pipeline' },
  { field: 'probability', label: 'Probability' },
  { field: 'visibility', label: 'Visibility' },
  { field: 'formId', label: 'Form' },
  { field: 'code', label: 'Code' },
  { field: 'age', label: 'Age' },
];

export async function generateStageActivityLogs(
  prevDocument: any,
  currentDocument: any,
  models: IModels,
  createActivityLog: (
    activities: ActivityLogInput | ActivityLogInput[],
  ) => void,
  subdomain: string,
): Promise<void> {
  const activityRegistry: ActivityRule[] = [
    fieldChangeRule(
      STAGE_ACTIVITY_FIELDS.map(({ field }) => field),
      'updated',
      (field) => getFieldLabel(field, STAGE_ACTIVITY_FIELDS),
    ),
    assignmentRule('memberIds', async (ids: string[]) =>
      fetchUsersByIds(subdomain, ids),
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
          collectionName: 'stages',
        },
      })),
    );
  }
}
