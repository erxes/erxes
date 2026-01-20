import {
  ActivityLogInput,
  ActivityRule,
  assignmentRule,
  buildActivities,
  fieldChangeRule,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

/** ------------------ FIELD CONFIGS ------------------ */
const BOARD_ACTIVITY_FIELDS = [
  { field: 'name', label: 'Name' },
  { field: 'type', label: 'Type' },
  { field: 'order', label: 'Order' },
];

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
  { field: 'assignedUserIds', label: 'Assignees' },
  { field: 'labelIds', label: 'Labels' },
  { field: 'productsData', label: 'Products' },
];

const CHECKLIST_ACTIVITY_FIELDS = [
  { field: 'title', label: 'Title' },
  { field: 'contentType', label: 'Content Type' },
  { field: 'contentTypeId', label: 'Content Item' },
];

const LABEL_ACTIVITY_FIELDS = [
  { field: 'name', label: 'Name' },
  { field: 'colorCode', label: 'Color Code' },
  { field: 'pipelineId', label: 'Pipeline' },
];

const getFieldLabel = (field: string, fieldConfig: Array<{ field: string; label: string }>) => {
  const match = fieldConfig.find(f => f.field === field);
  return match?.label || field;
};

/** ------------------ GENERIC BUILD FUNCTION ------------------ */
async function createActivityLogs(
  prevDocument: any,
  currentDocument: any,
  fieldConfig: Array<{ field: string; label: string }>,
  assignmentRules: ActivityRule[] = [],
  collectionName: string,
  createActivityLog: (activities: ActivityLogInput | ActivityLogInput[]) => void
) {
  const activityRegistry: ActivityRule[] = [
    fieldChangeRule(fieldConfig.map(f => f.field), 'updated', field => getFieldLabel(field, fieldConfig)),
    ...assignmentRules,
  ];

  const activities = await buildActivities(prevDocument, currentDocument, activityRegistry);

  if (activities.length) {
    createActivityLog(
      activities.map(activity => ({
        ...activity,
        changes: activity.changes || {},
        target: { _id: currentDocument._id, moduleName: 'sales', collectionName },
      }))
    );
  }
}

/** ------------------ BOARD ------------------ */
export async function generateBoardActivityLogs(
  prevDocument: any,
  currentDocument: any,
  models: IModels,
  createActivityLog: (activities: ActivityLogInput | ActivityLogInput[]) => void
) {
  await createActivityLogs(prevDocument, currentDocument, BOARD_ACTIVITY_FIELDS, [], 'boards', createActivityLog);
}

/** ------------------ PIPELINE ------------------ */
export async function generatePipelineActivityLogs(
  prevDocument: any,
  currentDocument: any,
  models: IModels,
  createActivityLog: (activities: ActivityLogInput | ActivityLogInput[]) => void
) {
  const assignmentRules: ActivityRule[] = [
    assignmentRule('memberIds', async ids => ids.map(id => id.toString())),
    assignmentRule('watchedUserIds', async ids => ids.map(id => id.toString())),
  ];

  await createActivityLogs(prevDocument, currentDocument, PIPELINE_ACTIVITY_FIELDS, assignmentRules, 'pipelines', createActivityLog);
}

/** ------------------ STAGE ------------------ */
export async function generateStageActivityLogs(
  prevDocument: any,
  currentDocument: any,
  models: IModels,
  createActivityLog: (activities: ActivityLogInput | ActivityLogInput[]) => void
) {
  const assignmentRules: ActivityRule[] = [
    assignmentRule('memberIds', async ids => ids.map(id => id.toString())),
  ];

  await createActivityLogs(prevDocument, currentDocument, STAGE_ACTIVITY_FIELDS, assignmentRules, 'stages', createActivityLog);
}

/** ------------------ DEAL ------------------ */
export async function generateDealActivityLogs(
  prevDocument: any,
  currentDocument: any,
  models: IModels,
  createActivityLog: (activities: ActivityLogInput | ActivityLogInput[]) => void
) {
  const assignmentRules: ActivityRule[] = [
    // Assigned users
    assignmentRule('assignedUserIds', async ids => ids.map(id => id.toString())),
    // Labels
    assignmentRule('labelIds', async ids =>
      ids.map(id => id.toString())
    ),
    // Products
   assignmentRule('productsData', async (products: any[]) => 
  products?.map(p => `${p.name || 'Product'} x ${p.quantity || 1}`) || []
),

  ];

  // Stage movement
  assignmentRules.push(
    fieldChangeRule(['stageId'], 'moved', async (field, { current, prev }) => {
      const currentStage = await models.Stages.findOne({ _id: current }, { name: 1 }).lean();
      const prevStage = await models.Stages.findOne({ _id: prev }, { name: 1 }).lean();
      return `From "${prevStage?.name || prev}" to "${currentStage?.name || current}"`;
    })
  );

  await createActivityLogs(prevDocument, currentDocument, DEAL_ACTIVITY_FIELDS, assignmentRules, 'deals', createActivityLog);
}

/** ------------------ CHECKLIST ------------------ */
export async function generateChecklistActivityLogs(
  prevDocument: any,
  currentDocument: any,
  models: IModels,
  createActivityLog: (activities: ActivityLogInput | ActivityLogInput[]) => void
) {
  await createActivityLogs(prevDocument, currentDocument, CHECKLIST_ACTIVITY_FIELDS, [], 'checklists', createActivityLog);
}

/** ------------------ CHECKLIST ITEM ------------------ */
export async function generateChecklistItemActivityLogs(
  prevDocument: any,
  currentDocument: any,
  models: IModels,
  createActivityLog: (activities: ActivityLogInput | ActivityLogInput[]) => void
) {
  const assignmentRules: ActivityRule[] = [
    fieldChangeRule(['content', 'order'], 'updated', field => (field === 'content' ? 'Content' : 'Order')),
    fieldChangeRule(
  ['isChecked'],
  'set',
  (field: string, { current, prev }: { current: boolean; prev: boolean }) =>
    current ? 'Checked' : 'Unchecked'
),


  ];

  await createActivityLogs(prevDocument, currentDocument, [], assignmentRules, 'checklistItems', createActivityLog);
}

/** ------------------ PIPELINE LABEL ------------------ */
export async function generatePipelineLabelActivityLogs(
  prevDocument: any,
  currentDocument: any,
  models: IModels,
  createActivityLog: (activities: ActivityLogInput | ActivityLogInput[]) => void
) {
  await createActivityLogs(prevDocument, currentDocument, LABEL_ACTIVITY_FIELDS, [], 'pipelineLabels', createActivityLog);
}

/** ------------------ DEAL CREATION ------------------ */
export function generateDealCreatedActivityLog(deal: any, userId?: string): ActivityLogInput {
  return {
    activityType: 'create',
    target: { _id: deal._id, moduleName: 'sales', collectionName: 'deals' },
    action: { type: 'create', description: 'Deal created' },
    changes: { name: deal.name, stageId: deal.stageId, createdAt: new Date() },
    metadata: { stageId: deal.stageId, userId: userId || deal.userId },
  };
}

/** ------------------ DEAL MOVEMENT ------------------ */
export function generateDealMovedActivityLog(
  deal: any,
  fromStageId: string,
  toStageId: string,
  fromStageName?: string,
  toStageName?: string
): ActivityLogInput {
  return {
    activityType: 'move',
    target: { _id: deal._id, moduleName: 'sales', collectionName: 'deals' },
    action: { type: 'move', description: 'Deal moved to different stage' },
    changes: { fromStage: fromStageName || fromStageId, toStage: toStageName || toStageId, movedAt: new Date() },
    metadata: { fromStageId, toStageId, dealId: deal._id },
  };
}

/** ------------------ DEAL CONVERSION ------------------ */
export function generateDealConvertedActivityLog(deal: any, conversationId: string): ActivityLogInput {
  return {
    activityType: 'convert',
    target: { _id: deal._id, moduleName: 'sales', collectionName: 'deals' },
    action: { type: 'convert', description: 'Conversation converted to deal' },
    changes: { sourceConversationId: conversationId, convertedAt: new Date() },
    metadata: { conversationId, dealId: deal._id },
  };
}
