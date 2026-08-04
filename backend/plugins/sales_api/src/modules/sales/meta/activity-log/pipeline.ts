import {
  ActivityLogInput,
  ActivityRule,
  assignmentRule,
  buildActivities,
  fieldChangeRule,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { fetchUsersByIds, getFieldLabel } from './common';

const PIPELINE_ACTIVITY_FIELDS = [
  { field: 'name', label: 'Name' },
  { field: 'type', label: 'Type' },
  { field: 'boardId', label: 'Board' },
  { field: 'status', label: 'Status' },
  { field: 'visibility', label: 'Visibility' },
  { field: 'bgColor', label: 'Background Color' },
  { field: 'startDate', label: 'Start Date' },
  { field: 'endDate', label: 'End Date' },
  { field: 'metric', label: 'Metric' },
  { field: 'hackScoringType', label: 'Scoring Type' },
];

export async function generatePipelineActivityLogs(
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
      PIPELINE_ACTIVITY_FIELDS.map(({ field }) => field),
      'updated',
      (field) => getFieldLabel(field, PIPELINE_ACTIVITY_FIELDS),
    ),
    fieldChangeRule(
      ['status'],
      'set',
      (field: string, { current }: { current: any; prev: any }) =>
        current === 'archived' ? 'Archived' : 'Active',
    ),
    assignmentRule('memberIds', async (ids: string[]) =>
      fetchUsersByIds(subdomain, ids),
    ),
    assignmentRule('watchedUserIds', async (ids: string[]) =>
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
          collectionName: 'pipelines',
        },
      })),
    );
  }
}
