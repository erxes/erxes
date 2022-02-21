import { debug } from './configs';
import {
  Boards,
  Pipelines,
  Stages,
  Deals,
  Tasks,
  Tickets,
  GrowthHacks,
  Checklists,
  ChecklistItems
} from './models';
import { sendConformityMessage, sendInboxRPCMessage } from './messageBroker';
import { getCollection } from './models/utils';

export const configReplacer = (config) => {
  const now = new Date();

  // replace type of date
  return config
    .replace(/\{year}/g, now.getFullYear().toString())
    .replace(/\{month}/g, (now.getMonth() + 1).toString())
    .replace(/\{day}/g, now.getDate().toString());
};

export const generateConditionStageIds = async ({
  boardId,
  pipelineId,
  options,
}: {
  boardId?: string;
  pipelineId?: string;
  options?: any;
}) => {
  let pipelineIds: string[] = [];

  if (options && options.pipelineId) {
    pipelineIds = [options.pipelineId];
  }

  if (boardId && (!options || !options.pipelineId)) {
    const board = await Boards.getBoard(boardId);

    const pipelines = await Pipelines.find(
      {
        _id: {
          $in: pipelineId ? [pipelineId] : board.pipelines || [],
        },
      },
      { _id: 1 }
    );

    pipelineIds = pipelines.map((p) => p._id);
  }

  const stages = await Stages.find({ pipelineId: pipelineIds }, { _id: 1 });

  return stages.map((s) => s._id);
};

export const getContentItem = async (activityLog) => {
  const { action, content, contentType, contentId } = activityLog;

  const type = contentType && typeof contentType === 'string' ? contentType.split(':')[1] : '';

  if (action === 'moved') {
    let item = {};

    switch (type) {
      case 'deal':
        item = await Deals.getDeal(contentId);
        break;
      case 'task':
        item = await Tasks.getTask(contentId);
        break;
      case 'growthHack':
        item = await GrowthHacks.getGrowthHack(contentId);
        break;
      case 'ticket':
        item = await Tickets.getTicket(contentId);
        break;
      default:
        break;
    }

    const { oldStageId, destinationStageId } = content;

    const destinationStage = await Stages.findOne({
      _id: destinationStageId,
    }).lean();
    const oldStage = await Stages.findOne({ _id: oldStageId }).lean();

    if (destinationStage && oldStage) {
      return {
        destinationStage: destinationStage.name,
        oldStage: oldStage.name,
        item,
      };
    }

    return {
      text: content.text,
    };
  }
};

export const getContentTypeDetail = async (activityLog) => {
  const { contentType, contentId, content } = activityLog;
  let item = {};

  try {
    switch (contentType) {
      case "deal":
        item = await Deals.getDeal(contentId);
        break;
      case "task":
        item = await Tasks.getTask(contentId);
        break;
      case "growthHack":
        item = await GrowthHacks.getGrowthHack(contentId);
        break;
      case "ticket":
        item = await Tickets.getTicket(contentId);
        break;
      case "checklist":
        item = (await Checklists.findOne({ _id: content._id })) || {};
        break;
      case "checklistitem":
        item = (await ChecklistItems.findOne({ _id: content._id })) || {};
        break;
    }
  } catch (e) {
    debug.error(e.message);

    return e.message;
  }

  return item;
};

export const collectTasks = async ({ contentType, contentId }) => {
  const relatedTaskIds = await sendConformityMessage('savedConformity', {
    mainType: contentType,
    mainTypeId: contentId,
    relTypes: ['task']
  });

  let items: any[] = [];

  if (contentType !== 'task') {
    items = await Tasks.find({
      $and: [
        { _id: { $in: relatedTaskIds } },
        { status: { $ne: 'archived' } }
      ]
    }).sort({ closeDate: 1 })

    items = items.map(i => {
      i.contentType = 'taskDetail';
      i.createdAt = i.closeDate || i.createdAt;

      return i;
    });
  }

  const contentIds = items
    .filter(activity => activity.action === 'convert')
    .map(activity => activity.content);

  const conversations = await sendInboxRPCMessage(
    'getIntegrations',
    { query: { _id: { $in: contentIds } } }
  ) || [];

  if (Array.isArray(contentIds) && conversations.length > 0) {
    for (const c of conversations) {
      items.push({
        _id: c._id,
        contentType: 'conversation',
        contentId,
        createdAt: c.createdAt
      });
    }
  }

  return items;
}

export const getCardContentIds = async ({ pipelineId, contentType }) => {
  const stageIds = await Stages.find({ pipelineId }).distinct('_id');
  const { collection } = getCollection(contentType);
  const contentIds = await collection
      .find({ stageId: { $in: stageIds } })
      .distinct('_id');

  return contentIds;
};
