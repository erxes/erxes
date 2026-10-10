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

const buildChecklistDealTarget = (checklist: any) => {
  if (!checklist.contentTypeId) {
    return null;
  }

  return {
    _id: checklist.contentTypeId,
    moduleName: 'sales',
    collectionName: 'deals',
  };
};

export async function generateChecklistActivityLogs(
  prevDocument: any,
  currentDocument: any,
  models: IModels,
  createActivityLog: (
    activities: ActivityLogInput | ActivityLogInput[],
  ) => void,
): Promise<void> {
  const target = buildChecklistDealTarget(currentDocument);

  if (!target) {
    return;
  }

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
        target,
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
  const checklist = await models.Checklists.findOne({
    _id: currentDocument.checklistId,
  }).lean();

  if (!checklist) {
    return;
  }

  const target = buildChecklistDealTarget(checklist);

  if (!target) {
    return;
  }

  const activityRegistry: ActivityRule[] = [
    fieldChangeRule(['content', 'order'], 'updated', (field: string) =>
      field === 'content' ? 'Content' : 'Order',
    ),
  ];

  const builtActivities = await buildActivities(
    prevDocument,
    currentDocument,
    activityRegistry,
  );

  const manualActivities: ActivityLogInput[] = [];

  if (prevDocument.isChecked !== currentDocument.isChecked) {
    manualActivities.push({
      activityType: currentDocument.isChecked
        ? 'checklist.item_checked'
        : 'checklist.item_unchecked',
      target,
      action: {
        type: currentDocument.isChecked ? 'check' : 'uncheck',
        description: currentDocument.isChecked
          ? 'checked checklist item'
          : 'unchecked checklist item',
      },
      changes: {
        current: {
          isChecked: currentDocument.isChecked,
        },
      },
      metadata: {
        checklistTitle: checklist.title,
        checklistItemTitle: currentDocument.content,
        checklistId: currentDocument.checklistId,
        checklistItemId: currentDocument._id,
      },
    });
  }

  const activities: ActivityLogInput[] = [
    ...builtActivities.map((activity) => ({
      ...activity,
      changes: activity.changes || {},
      target,
      metadata: {
        checklistTitle: checklist.title,
        checklistItemTitle: currentDocument.content,
        ...activity.metadata,
      },
    })),
    ...manualActivities,
  ];

  if (activities.length > 0) {
    createActivityLog(activities);
  }
}

export function generateChecklistCreatedActivityLog(
  checklist: any,
  userId?: string,
): ActivityLogInput | null {
  const target = buildChecklistDealTarget(checklist);

  if (!target) {
    return null;
  }

  return {
    activityType: 'checklist.create',
    target,
    action: {
      type: 'create',
      description: 'created checklist',
    },
    changes: {
      checklistId: checklist._id,
      createdAt: new Date(),
    },
    metadata: {
      checklistId: checklist._id,
      checklistTitle: checklist.title,
      userId: userId || checklist.userId || checklist.createdUserId,
    },
  };
}

export function generateChecklistRemovedActivityLog(
  checklist: any,
  userId?: string,
): ActivityLogInput | null {
  const target = buildChecklistDealTarget(checklist);

  if (!target) {
    return null;
  }

  return {
    activityType: 'checklist.remove',
    target,
    action: {
      type: 'delete',
      description: 'removed checklist',
    },
    changes: {
      checklistId: checklist._id,
      removedAt: new Date(),
    },
    metadata: {
      checklistId: checklist._id,
      checklistTitle: checklist.title,
      userId: userId || checklist.userId || checklist.createdUserId,
    },
  };
}

export function generateChecklistItemCreatedActivityLog(
  checklistItem: any,
  checklist: any,
  userId?: string,
): ActivityLogInput | null {
  const target = buildChecklistDealTarget(checklist);

  if (!target) {
    return null;
  }

  return {
    activityType: 'checklist.item_create',
    target,
    action: {
      type: 'create',
      description: 'added checklist item',
    },
    changes: {
      checklistId: checklistItem.checklistId,
      checklistItemId: checklistItem._id,
      createdAt: new Date(),
    },
    metadata: {
      checklistId: checklistItem.checklistId,
      checklistItemId: checklistItem._id,
      checklistTitle: checklist.title,
      checklistItemTitle: checklistItem.content,
      userId: userId || checklistItem.userId || checklistItem.createdUserId,
    },
  };
}

export function generateChecklistItemRemovedActivityLog(
  checklistItem: any,
  checklist: any,
  userId?: string,
): ActivityLogInput | null {
  const target = buildChecklistDealTarget(checklist);

  if (!target) {
    return null;
  }

  return {
    activityType: 'checklist.item_remove',
    target,
    action: {
      type: 'delete',
      description: 'removed checklist item',
    },
    changes: {
      checklistId: checklistItem.checklistId,
      checklistItemId: checklistItem._id,
      removedAt: new Date(),
    },
    metadata: {
      checklistId: checklistItem.checklistId,
      checklistItemId: checklistItem._id,
      checklistTitle: checklist.title,
      checklistItemTitle: checklistItem.content,
      userId: userId || checklistItem.userId || checklistItem.createdUserId,
    },
  };
}
