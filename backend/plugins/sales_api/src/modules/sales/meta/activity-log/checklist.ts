import {
  ActivityLogInput,
  ActivityRule,
  buildActivities,
  fieldChangeRule,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { getFieldLabel } from './common';

const CHECKLIST_ACTIVITY_FIELDS = [
  { field: 'title', label: 'Title' },
  { field: 'contentType', label: 'Content Type' },
  { field: 'contentTypeId', label: 'Content Item' },
];

export async function generateChecklistActivityLogs(
  prevDocument: any,
  currentDocument: any,
  models: IModels,
  createActivityLog: (
    activities: ActivityLogInput | ActivityLogInput[],
  ) => void,
): Promise<void> {
  const activityRegistry: ActivityRule[] = [
    fieldChangeRule(
      CHECKLIST_ACTIVITY_FIELDS.map(({ field }) => field),
      'updated',
      (field) => getFieldLabel(field, CHECKLIST_ACTIVITY_FIELDS),
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
          collectionName: 'checklists',
        },
      })),
    );
  }
}

export async function generateChecklistItemActivityLogs(
  prevDocument: any,
  currentDocument: any,
  models: IModels,
  createActivityLog: (
    activities: ActivityLogInput | ActivityLogInput[],
  ) => void,
): Promise<void> {
  const activityRegistry: ActivityRule[] = [
    fieldChangeRule(['content', 'order'], 'updated', (field: string) =>
      field === 'content' ? 'Content' : 'Order',
    ),
    fieldChangeRule(
      ['isChecked'],
      'set',
      (field: string, { current }: { current: any; prev: any }) =>
        current ? 'Checked' : 'Unchecked',
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
          collectionName: 'checklistItems',
        },
      })),
    );
  }
}

export function generateChecklistCreatedActivityLog(
  checklist: any,
  userId?: string,
): ActivityLogInput {
  return {
    activityType: 'create',
    target: {
      _id: checklist._id,
      moduleName: 'sales',
      collectionName: 'checklists',
    },
    action: {
      type: 'create',
      description: `Checklist created ${checklist.title}`,
    },
    changes: {
      title: checklist.title,
      contentType: checklist.contentType,
      contentTypeId: checklist.contentTypeId,
      createdAt: new Date(),
    },
    metadata: {
      contentType: checklist.contentType,
      contentTypeId: checklist.contentTypeId,
      userId: userId || checklist.userId || checklist.createdUserId,
    },
  };
}

export function generateChecklistRemovedActivityLog(
  checklist: any,
  userId?: string,
): ActivityLogInput {
  return {
    activityType: 'delete',
    target: {
      _id: checklist._id,
      moduleName: 'sales',
      collectionName: 'checklists',
    },
    action: {
      type: 'delete',
      description: `Checklist removed ${checklist.title}`,
    },
    changes: {
      title: checklist.title,
      contentType: checklist.contentType,
      contentTypeId: checklist.contentTypeId,
      removedAt: new Date(),
    },
    metadata: {
      contentType: checklist.contentType,
      contentTypeId: checklist.contentTypeId,
      userId: userId || checklist.userId || checklist.createdUserId,
    },
  };
}

export function generateChecklistItemCreatedActivityLog(
  checklistItem: any,
  userId?: string,
): ActivityLogInput {
  return {
    activityType: 'create',
    target: {
      _id: checklistItem._id,
      moduleName: 'sales',
      collectionName: 'checklistItems',
    },
    action: {
      type: 'create',
      description: `Checklist item created ${checklistItem.content}`,
    },
    changes: {
      content: checklistItem.content,
      checklistId: checklistItem.checklistId,
      createdAt: new Date(),
    },
    metadata: {
      checklistId: checklistItem.checklistId,
      userId: userId || checklistItem.userId || checklistItem.createdUserId,
    },
  };
}

export function generateChecklistItemRemovedActivityLog(
  checklistItem: any,
  userId?: string,
): ActivityLogInput {
  return {
    activityType: 'delete',
    target: {
      _id: checklistItem._id,
      moduleName: 'sales',
      collectionName: 'checklistItems',
    },
    action: {
      type: 'delete',
      description: `Checklist item removed ${checklistItem.content}`,
    },
    changes: {
      content: checklistItem.content,
      checklistId: checklistItem.checklistId,
      removedAt: new Date(),
    },
    metadata: {
      checklistId: checklistItem.checklistId,
      userId: userId || checklistItem.userId || checklistItem.createdUserId,
    },
  };
}
