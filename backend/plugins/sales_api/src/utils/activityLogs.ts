import {
  ActivityLogInput,
  ActivityRule,
  assignmentRule,
  buildActivities,
  fieldChangeRule,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

// Board activity fields
const BOARD_ACTIVITY_FIELDS = [
  { field: 'name', label: 'Name' },
  { field: 'type', label: 'Type' },
  { field: 'order', label: 'Order' },
];

// Pipeline activity fields
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

// Stage activity fields
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

// Deal activity fields
const DEAL_ACTIVITY_FIELDS = [
  { field: 'name', label: 'Name' },
  { field: 'stageId', label: 'Stage' },
  { field: 'status', label: 'Status' },
  { field: 'priority', label: 'Priority' },
  { field: 'description', label: 'Description' },
  { field: 'startDate', label: 'Start Date' },
  { field: 'closeDate', label: 'Close Date' },
  { field: 'number', label: 'Deal Number' },
  { field: 'score', label: 'Score' },
];

// Checklist activity fields
const CHECKLIST_ACTIVITY_FIELDS = [
  { field: 'title', label: 'Title' },
  { field: 'contentType', label: 'Content Type' },
  { field: 'contentTypeId', label: 'Content Item' },
];

// Label activity fields
const LABEL_ACTIVITY_FIELDS = [
  { field: 'name', label: 'Name' },
  { field: 'colorCode', label: 'Color Code' },
  { field: 'pipelineId', label: 'Pipeline' },
];

const getFieldLabel = (field: string, fieldConfig: Array<{field: string, label: string}>) => {
  const match = fieldConfig.find(f => f.field === field);
  return match?.label || field;
};

/**
 * Generate activity logs for Board changes
 */
export async function generateBoardActivityLogs(
  prevDocument: any,
  currentDocument: any,
  models: IModels,
  createActivityLog: (activities: ActivityLogInput | ActivityLogInput[]) => void,
): Promise<void> {
  const activityRegistry: ActivityRule[] = [
    fieldChangeRule(
      BOARD_ACTIVITY_FIELDS.map(({ field }) => field),
      'updated',
      (field) => getFieldLabel(field, BOARD_ACTIVITY_FIELDS),
    ),
    fieldChangeRule(['status'], 'set', (field: string, { current }: { current: any; prev: any }) => 
      current === 'archived' ? 'Archived' : 'Active'
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

/**
 * Generate activity logs for Pipeline changes
 */
export async function generatePipelineActivityLogs(
  prevDocument: any,
  currentDocument: any,
  models: IModels,
  createActivityLog: (activities: ActivityLogInput | ActivityLogInput[]) => void ,
): Promise<void> {
  const activityRegistry: ActivityRule[] = [
    fieldChangeRule(
      PIPELINE_ACTIVITY_FIELDS.map(({ field }) => field),
      'updated',
      (field) => getFieldLabel(field, PIPELINE_ACTIVITY_FIELDS),
    ),
    fieldChangeRule(['status'], 'set', (field: string, { current }: { current: any; prev: any }) => 
      current === 'archived' ? 'Archived' : 'Active'
    ),
    assignmentRule('memberIds', async (ids: string[]) => {
      // In sales plugin, we don't have Users model directly accessible
      // Return IDs as strings
      return ids.map(id => id.toString());
    }),
    assignmentRule('watchedUserIds', async (ids: string[]) => {
      // Return IDs as strings
      return ids.map(id => id.toString());
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
          moduleName: 'sales',
          collectionName: 'pipelines',
        },
      })),
    );
  }
}

/**
 * Generate activity logs for Stage changes
 */
export async function generateStageActivityLogs(
  prevDocument: any,
  currentDocument: any,
  models: IModels,
  createActivityLog: (activities: ActivityLogInput | ActivityLogInput[]) => void,
): Promise<void> {
  const activityRegistry: ActivityRule[] = [
    fieldChangeRule(
      STAGE_ACTIVITY_FIELDS.map(({ field }) => field),
      'updated',
      (field) => getFieldLabel(field, STAGE_ACTIVITY_FIELDS),
    ),
    assignmentRule('memberIds', async (ids: string[]) => {
      // Return IDs as strings
      return ids.map(id => id.toString());
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
          moduleName: 'sales',
          collectionName: 'stages',
        },
      })),
    );
  }
}

/**
 * Generate activity logs for Deal changes
 */
export async function generateDealActivityLogs(
  prevDocument: any,
  currentDocument: any,
  models: IModels,
  createActivityLog: (activities: ActivityLogInput | ActivityLogInput[]) => void,
): Promise<void> {
  const activityRegistry: ActivityRule[] = [
    fieldChangeRule(
      DEAL_ACTIVITY_FIELDS.map(({ field }) => field),
      'updated',
      (field) => getFieldLabel(field, DEAL_ACTIVITY_FIELDS),
    ),
    fieldChangeRule(['stageId'], 'moved', async (field: string, { current, prev }: { current: any; prev: any }) => {
      const [currentStage, prevStage] = await Promise.all([
        models.Stages.findOne({ _id: current }, { name: 1 }),
        models.Stages.findOne({ _id: prev }, { name: 1 }),
      ]);
      return `From "${prevStage?.name || prev}" to "${currentStage?.name || current}"`;
    }),
    assignmentRule('assignedUserIds', async (ids: string[]) => {
      // Return IDs as strings
      return ids.map(id => id.toString());
    }),
    assignmentRule('labelIds', async (ids: string[]) => {
      const labels = await models.PipelineLabels.find(
        { _id: { $in: ids } },
        { name: 1, colorCode: 1 },
      ).lean();
      return labels.map(label => `${label.name} (${label.colorCode})`);
    }),
    assignmentRule('productsData', async (products: any[]) => {
      return products?.map((product: any) => 
        `${product.name || 'Product'} x ${product.quantity}`
      ) || [];
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
          moduleName: 'sales',
          collectionName: 'deals',
        },
      })),
    );
  }
}

/**
 * Generate activity logs for Checklist changes
 */
export async function generateChecklistActivityLogs(
  prevDocument: any,
  currentDocument: any,
  models: IModels,
  createActivityLog: (activities: ActivityLogInput | ActivityLogInput[]) => void,
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

/**
 * Generate activity logs for Checklist Item changes
 */
export async function generateChecklistItemActivityLogs(
  prevDocument: any,
  currentDocument: any,
  models: IModels,
  createActivityLog: (activities: ActivityLogInput | ActivityLogInput[]) => void,
): Promise<void> {
  const activityRegistry: ActivityRule[] = [
    fieldChangeRule(['content', 'order'], 'updated', (field: string) => 
      field === 'content' ? 'Content' : 'Order'
    ),
    fieldChangeRule(['isChecked'], 'set', (field: string, { current }: { current: any; prev: any }) =>
      current ? 'Checked' : 'Unchecked'
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

/**
 * Generate activity logs for Pipeline Label changes
 */
export async function generatePipelineLabelActivityLogs(
  prevDocument: any,
  currentDocument: any,
  models: IModels,
  createActivityLog: (activities: ActivityLogInput | ActivityLogInput[]) => void,
): Promise<void> {
  const activityRegistry: ActivityRule[] = [
    fieldChangeRule(
      LABEL_ACTIVITY_FIELDS.map(({ field }) => field),
      'updated',
      (field) => getFieldLabel(field, LABEL_ACTIVITY_FIELDS),
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
          collectionName: 'pipelineLabels',
        },
      })),
    );
  }
}

/**
 * Generate activity log for deal creation
 */
export function generateDealCreatedActivityLog(deal: any, userId?: string): ActivityLogInput {
  return {
    activityType: 'create',
    target: {
      _id: deal._id,
      moduleName: 'sales',
      collectionName: 'deals',
    },
    action: {
      type: 'create',
      description: 'Deal created',
    },
    changes: {
      name: deal.name,
      stageId: deal.stageId,
      createdAt: new Date(),
    },
    metadata: {
      stageId: deal.stageId,
      userId: userId || deal.userId,
    },
  };
}

/**
 * Generate activity log for deal movement between stages
 */
export function generateDealMovedActivityLog(
  deal: any,
  fromStageId: string,
  toStageId: string,
  fromStageName?: string,
  toStageName?: string,
): ActivityLogInput {
  return {
    activityType: 'move',
    target: {
      _id: deal._id,
      moduleName: 'sales',
      collectionName: 'deals',
    },
    action: {
      type: 'move',
      description: 'Deal moved to different stage',
    },
    changes: {
      fromStage: fromStageName || fromStageId,
      toStage: toStageName || toStageId,
      movedAt: new Date(),
    },
    metadata: {
      fromStageId,
      toStageId,
      dealId: deal._id,
    },
  };
}

/**
 * Generate activity log for deal conversion from conversation
 */
export function generateDealConvertedActivityLog(deal: any, conversationId: string): ActivityLogInput {
  return {
    activityType: 'convert',
    target: {
      _id: deal._id,
      moduleName: 'sales',
      collectionName: 'deals',
    },
    action: {
      type: 'convert',
      description: 'Conversation converted to deal',
    },
    changes: {
      sourceConversationId: conversationId,
      convertedAt: new Date(),
    },
    metadata: {
      conversationId,
      dealId: deal._id,
    },
  };
}