import { getCollection } from "./models/utils";
import { CARD_PROPERTIES_INFO, MODULE_NAMES } from "./constants";
import { generateModels, IModels } from "./connectionResolver";
import { sendCoreMessage } from "./messageBroker";
import { IUserDocument } from "@erxes/api-utils/src/types";
import { debugError } from "@erxes/api-utils/src/debuggers";

export const configReplacer = config => {
  const now = new Date();

  // replace type of date
  return config
    .replace(/\{year}/g, now.getFullYear().toString())
    .replace(/\{month}/g, `0${(now.getMonth() + 1).toString()}`.slice(-2))
    .replace(/\{day}/g, `0${now.getDate().toString()}`.slice(-2));
};

export const collectItems = async (
  models: IModels,
  subdomain: string,
  { contentType, contentId }
) => {
  let tasks: any[] = [];

  if (contentType === "activity") {
    return;
  }

  // const relatedTaskIds = await sendCoreMessage({
  //   subdomain,
  //   action: "conformities.savedConformity",
  //   data: {
  //     mainType: contentType.split(":")[1],
  //     mainTypeId: contentId,
  //     relTypes: ["task"]
  //   },
  //   isRPC: true,
  //   defaultValue: []
  // });

  // if (contentType !== "cards:task") {
  //   tasks = await models.Tasks.aggregate([
  //     {
  //       $match: {
  //         $and: [
  //           { _id: { $in: relatedTaskIds } },
  //           { status: { $ne: "archived" } }
  //         ]
  //       }
  //     },
  //     {
  //       $addFields: { contentType: "cards:taskDetail" }
  //     },
  //     {
  //       $project: {
  //         _id: 1,
  //         contentType: 1,
  //         createdAt: {
  //           $switch: {
  //             branches: [
  //               {
  //                 case: { $gt: ["$closeDate", null] },
  //                 then: "$closeDate"
  //               }
  //             ],
  //             default: "$createdAt"
  //           }
  //         }
  //       }
  //     },
  //     { $sort: { closeDate: 1 } }
  //   ]);
  // }

  return tasks;
};

export const generateConditionStageIds = async (
  models: IModels,
  {
    boardId,
    pipelineId,
    options
  }: {
    boardId?: string;
    pipelineId?: string;
    options?: any;
  }
) => {
  let pipelineIds: string[] = [];

  if (options && options.pipelineId) {
    pipelineIds = [options.pipelineId];
  }

  if (boardId && (!options || !options.pipelineId)) {
    const board = await models.Boards.getBoard(boardId);

    const pipelines = await models.Pipelines.find(
      {
        _id: {
          $in: pipelineId ? [pipelineId] : board.pipelines || []
        }
      },
      { _id: 1 }
    );

    pipelineIds = pipelines.map(p => p._id);
  }

  const stages = await models.Stages.find(
    { pipelineId: pipelineIds },
    { _id: 1 }
  );

  return stages.map(s => s._id);
};

export const getContentItem = async (subdomain, data) => {
  const models = await generateModels(subdomain);

  const { Stages, Tickets } = models;
  const { action, content, contentType, contentId } = data;

  const type =
    contentType && typeof contentType === "string"
      ? contentType.split(":")[1]
      : "";

  if (action === "moved") {
    let item = {};

    switch (type) {
      case "ticket":
        item = await Tickets.getTicket(contentId);
      default:
        break;
    }

    const { oldStageId, destinationStageId } = content;

    const destinationStage = await Stages.findOne({
      _id: destinationStageId
    }).lean();
    const oldStage = await Stages.findOne({ _id: oldStageId }).lean();

    if (destinationStage && oldStage) {
      return {
        destinationStage: destinationStage.name,
        oldStage: oldStage.name,
        item
      };
    }

    return {
      text: content.text
    };
  }

  if (action === "moved") {
    let item = {};

    switch (type) {
      case "ticket":
        item = await Tickets.getTicket(contentId);
      default:
        break;
    }

    const { oldStageId, destinationStageId } = content;

    const destinationStage = await Stages.findOne({
      _id: destinationStageId
    }).lean();
    const oldStage = await Stages.findOne({ _id: oldStageId }).lean();

    if (destinationStage && oldStage) {
      return {
        destinationStage: destinationStage.name,
        oldStage: oldStage.name,
        item
      };
    }

    return {
      text: content.text
    };
  }

  if (action === "assignee") {
    let addedUsers: IUserDocument[] = [];
    let removedUsers: IUserDocument[] = [];

    if (content) {
      addedUsers = await sendCoreMessage({
        subdomain,
        action: "users.find",
        data: {
          query: {
            _id: { $in: content.addedUserIds }
          }
        },
        isRPC: true,
        defaultValue: []
      });

      removedUsers = await sendCoreMessage({
        subdomain,
        action: "users.find",
        data: {
          query: {
            _id: { $in: content.removedUserIds }
          }
        },
        isRPC: true,
        defaultValue: []
      });
    }

    return { addedUsers, removedUsers };
  }
};

export const getContentTypeDetail = async (subdomain, data) => {
  const models = await generateModels(subdomain);

  const { ChecklistItems, Checklists, Tickets } = models;
  const { contentType = "", contentId, content } = data;

  let item = {};

  try {
    switch (contentType.split(":")[1]) {
      case "checklist":
        item = (await Checklists.findOne({ _id: content._id })) || {};
        break;
      case "checklistitem":
        item = (await ChecklistItems.findOne({ _id: content._id })) || {};
        break;
      case "ticket":
        item = await Tickets.getTicket(contentId);
        break;
    }
  } catch (e) {
    debugError(e.message);

    return e.message;
  }

  return item;
};

// contentType should come with "tickets:deal|ticket" format
export const getCardContentIds = async (
  models: IModels,
  { pipelineId, contentType }
) => {
  const type =
    contentType.indexOf(":") !== -1 ? contentType.split(":")[1] : contentType;
  const stageIds = await models.Stages.find({ pipelineId }).distinct("_id");
  const { collection } = getCollection(models, type);

  return collection.find({ stageId: { $in: stageIds } }).distinct("_id");
};

export const getCardItem = async (
  models: IModels,
  { contentTypeId, contentType }
) => {
  const { Tickets } = models;
  const filter = { _id: contentTypeId };

  let item;

  switch (contentType) {
    case MODULE_NAMES.TICKET:
      item = await Tickets.findOne(filter);
      break;
    default:
      break;
  }

  return item;
};

export const getBoardsAndPipelines = doc => {
  const { config } = doc;

  if (!config || !config.boardsPipelines) {
    return doc;
  }

  const boardIds: string[] = [];
  const pipelineIds: string[] = [];

  const boardsPipelines = config.boardsPipelines || [];

  for (const item of boardsPipelines) {
    boardIds.push(item.boardId || "");

    const pipelines = item.pipelineIds || [];

    for (const pipelineId of pipelines) {
      pipelineIds.push(pipelineId);
    }
  }

  config.boardIds = boardIds;
  config.pipelineIds = pipelineIds;

  doc.config = config;

  return doc;
};

export const generateSystemFields = ({ data: { groupId, type } }) => {
  const fields: any = [];

  CARD_PROPERTIES_INFO.ALL.map(e => {
    fields.push({
      text: e.label,
      type: e.type,
      field: e.field,
      canHide: e.canHide,
      validation: e.validation,
      groupId,
      options: e.options,
      contentType: `tickets:${type}`,
      isDefinedByErxes: true
    });
  });

  return fields;
};
