import { IPipelineDocument, IStageDocument } from './models/definitions/boards';
import { IDealDocument } from './models/definitions/deals';
import { IPurchaseDocument } from './models/definitions/purchases';
import { IGrowthHackDocument } from './models/definitions/growthHacks';
import { IPipelineTemplateDocument } from './models/definitions/pipelineTemplates';
import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  putActivityLog as commonPutActivityLog,
  LogDesc,
  gatherNames,
  gatherUsernames,
  IDescriptions,
  getSchemaLabels
} from '@erxes/api-utils/src/logUtils';
import { ITaskDocument } from './models/definitions/tasks';
import { ITicketDocument } from './models/definitions/tickets';
import { LOG_MAPPINGS, MODULE_NAMES } from './constants';
import { ACTIVITY_CONTENT_TYPES } from './models/definitions/constants';
import messageBroker, {
  sendCoreMessage,
  sendFormsMessage,
  sendLogsMessage,
  sendProductsMessage,
  sendToWebhook
} from './messageBroker';
import { IModels, generateModels } from './connectionResolver';
import {
  collectItems,
  getCardContentIds,
  getContentItem,
  getContentTypeDetail
} from './utils';

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

type BoardItemDocument =
  | IDealDocument
  | IPurchaseDocument
  | ITaskDocument
  | ITicketDocument
  | IGrowthHackDocument;

const findUsers = async (subdomain: string, ids: string[]) => {
  return sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {
      query: {
        _id: { $in: ids }
      }
    },
    isRPC: true
  });
};

const gatherPipelineFieldNames = async (
  models: IModels,
  subdomain: string,
  doc: IPipelineDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  const { Boards } = models;

  options = await gatherNames({
    foreignKey: 'boardId',
    nameFields: ['name'],
    prevList: options,
    items: await Boards.find({ _id: doc.boardId }).lean()
  });

  if (doc.userId) {
    options = await gatherUsernames({
      foreignKey: 'userId',
      prevList: options,
      items: await findUsers(subdomain, [doc.userId])
    });
  }

  if (doc.excludeCheckUserIds && doc.excludeCheckUserIds.length > 0) {
    options = await gatherUsernames({
      foreignKey: 'excludeCheckUserIds',
      prevList: options,
      items: await findUsers(subdomain, doc.excludeCheckUserIds)
    });
  }

  if (doc.memberIds && doc.memberIds.length > 0) {
    options = await gatherUsernames({
      foreignKey: 'memberIds',
      prevList: options,
      items: await findUsers(subdomain, doc.memberIds)
    });
  }

  if (doc.watchedUserIds && doc.watchedUserIds.length > 0) {
    options = await gatherUsernames({
      foreignKey: 'watchedUserIds',
      prevList: options,
      items: await findUsers(subdomain, doc.watchedUserIds)
    });
  }

  return options;
};

const gatherBoardItemFieldNames = async (
  models: IModels,
  subdomain: string,
  doc: BoardItemDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  const { PipelineLabels, Stages } = models;

  if (doc.userId) {
    options = await gatherUsernames({
      foreignKey: 'userId',
      prevList: options,
      items: await findUsers(subdomain, [doc.userId])
    });
  }

  if (doc.assignedUserIds && doc.assignedUserIds.length > 0) {
    options = await gatherUsernames({
      foreignKey: 'assignedUserIds',
      prevList: options,
      items: await findUsers(subdomain, doc.assignedUserIds)
    });
  }

  if (doc.watchedUserIds && doc.watchedUserIds.length > 0) {
    options = await gatherUsernames({
      foreignKey: 'watchedUserIds',
      prevList: options,
      items: await findUsers(subdomain, doc.watchedUserIds)
    });
  }

  if (doc.labelIds && doc.labelIds.length > 0) {
    options = await gatherNames({
      foreignKey: 'labelIds',
      prevList: options,
      nameFields: ['name'],
      items: await PipelineLabels.find({ _id: { $in: doc.labelIds } }).lean()
    });
  }

  options = await gatherNames({
    foreignKey: 'stageId',
    prevList: options,
    nameFields: ['name'],
    items: await Stages.find({ _id: doc.stageId })
  });

  if (doc.initialStageId) {
    options = await gatherNames({
      foreignKey: 'initialStageId',
      prevList: options,
      nameFields: ['name'],
      items: await Stages.find({ _id: doc.initialStageId })
    });
  }

  if (doc.modifiedBy) {
    options = await gatherUsernames({
      foreignKey: 'modifiedBy',
      prevList: options,
      items: await findUsers(subdomain, [doc.modifiedBy])
    });
  }

  return options;
};

const gatherDealFieldNames = async (
  models: IModels,
  subdomain: string,
  doc: IDealDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  options = await gatherBoardItemFieldNames(models, subdomain, doc, options);

  if (doc.productsData && doc.productsData.length > 0) {
    options = await gatherNames({
      foreignKey: 'productId',
      prevList: options,
      nameFields: ['name'],
      items: await sendProductsMessage({
        subdomain,
        action: 'find',
        data: {
          query: {
            _id: { $in: doc.productsData.map(p => p.productId) }
          }
        },
        isRPC: true,
        defaultValue: []
      })
    });
  }

  return options;
};

const gatherPurchaseFieldNames = async (
  models: IModels,
  subdomain: string,
  doc: IPurchaseDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  options = await gatherBoardItemFieldNames(models, subdomain, doc, options);

  if (doc.productsData && doc.productsData.length > 0) {
    options = await gatherNames({
      foreignKey: 'productId',
      prevList: options,
      nameFields: ['name'],
      items: await sendProductsMessage({
        subdomain,
        action: 'find',
        data: {
          query: {
            _id: { $in: doc.productsData.map(p => p.productId) }
          }
        },
        isRPC: true,
        defaultValue: []
      })
    });
  }

  return options;
};

const gatherGHFieldNames = async (
  models: IModels,
  subdomain: string,
  doc: IGrowthHackDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  options = await gatherBoardItemFieldNames(models, subdomain, doc, options);

  if (doc.votedUserIds && doc.votedUserIds.length > 0) {
    options = await gatherUsernames({
      foreignKey: 'votedUserIds',
      prevList: options,
      items: await findUsers(subdomain, doc.votedUserIds)
    });
  }

  return options;
};

const gatherPipelineTemplateFieldNames = async (
  subdomain: string,
  doc: IPipelineTemplateDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  options = await gatherUsernames({
    foreignKey: 'createdBy',
    prevList: options,
    items: await findUsers(subdomain, [doc.createdBy || ''])
  });

  if (doc.stages && doc.stages.length > 0) {
    options = await gatherNames({
      foreignKey: 'formId',
      prevList: options,
      nameFields: ['title'],
      items: await sendFormsMessage({
        subdomain,
        action: 'find',
        data: { _id: { $in: doc.stages.map(s => s.formId) } },
        isRPC: true,
        defaultValue: []
      })
    });
  }

  return options;
};

const gatherStageFieldNames = async (
  models: IModels,
  subdomain: string,
  doc: IStageDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.userId) {
    options = await gatherUsernames({
      foreignKey: 'userId',
      prevList: options,
      items: await findUsers(subdomain, [doc.userId])
    });
  }
  if (doc.pipelineId) {
    options = await gatherNames({
      foreignKey: 'pipelineId',
      prevList: options,
      nameFields: ['name'],
      items: await models.Pipelines.find({ _id: doc.pipelineId })
    });
  }
  if (doc.formId) {
    options = await gatherNames({
      foreignKey: 'formId',
      prevList: options,
      nameFields: ['title'],
      items: await sendFormsMessage({
        subdomain,
        action: 'find',
        data: { _id: { $in: [doc.formId] } },
        isRPC: true
      })
    });
  }

  return options;
};

interface IContentTypeParams {
  contentType: string;
  contentTypeId: string;
}

const findItemName = async (
  models: IModels,
  { contentType, contentTypeId }: IContentTypeParams
): Promise<string> => {
  const { Deals, Tickets, Tasks, GrowthHacks, Purchases } = models;

  let item: any;
  let name: string = '';

  if (contentType === ACTIVITY_CONTENT_TYPES.DEAL) {
    item = await Deals.findOne({ _id: contentTypeId });
  }

  if (contentType === ACTIVITY_CONTENT_TYPES.PURCHASE) {
    item = await Purchases.findOne({ _id: contentTypeId });
  }

  if (contentType === ACTIVITY_CONTENT_TYPES.TASK) {
    item = await Tasks.findOne({ _id: contentTypeId });
  }

  if (contentType === ACTIVITY_CONTENT_TYPES.TICKET) {
    item = await Tickets.findOne({ _id: contentTypeId });
  }

  if (contentType === ACTIVITY_CONTENT_TYPES.GROWTH_HACK) {
    item = await GrowthHacks.getGrowthHack(contentTypeId);
  }

  if (item && item.name) {
    name = item.name;
  }

  return name;
};

const gatherDescriptions = async (
  models: IModels,
  subdomain: string,
  params: any
): Promise<IDescriptions> => {
  const { action, type, object, updatedDocument } = params;

  let extraDesc: LogDesc[] = [];
  let description: string = '';

  switch (type) {
    case MODULE_NAMES.BOARD_DEAL:
    case MODULE_NAMES.BOARD_PURCHASE:
    case MODULE_NAMES.BOARD_GH:
    case MODULE_NAMES.BOARD_TASK:
    case MODULE_NAMES.BOARD_TICKET:
      if (object.userId) {
        extraDesc = await gatherUsernames({
          foreignKey: 'userId',
          items: await findUsers(subdomain, [object.userId])
        });
      }

      description = `"${object.name}" has been ${action}d`;

      break;
    case MODULE_NAMES.PIPELINE_DEAL:
    case MODULE_NAMES.BOARD_PURCHASE:
    case MODULE_NAMES.PIPELINE_GH:
    case MODULE_NAMES.PIPELINE_TASK:
    case MODULE_NAMES.PIPELINE_TICKET:
      extraDesc = await gatherPipelineFieldNames(models, subdomain, object);

      if (updatedDocument) {
        extraDesc = await gatherPipelineFieldNames(
          models,
          subdomain,
          updatedDocument,
          extraDesc
        );
      }

      description = `"${object.name}" has been ${action}d`;

      break;
    case MODULE_NAMES.DEAL:
      description = `"${object.name}" has been ${action}d`;
      extraDesc = await gatherDealFieldNames(models, subdomain, object);

      if (updatedDocument) {
        extraDesc = await gatherDealFieldNames(
          models,
          subdomain,
          updatedDocument,
          extraDesc
        );
      }

      break;
    case MODULE_NAMES.PURCHASE:
      description = `"${object.name}" has been ${action}d`;
      extraDesc = await gatherPurchaseFieldNames(models, subdomain, object);

      if (updatedDocument) {
        extraDesc = await gatherPurchaseFieldNames(
          models,
          subdomain,
          updatedDocument,
          extraDesc
        );
      }
      break;
    case MODULE_NAMES.GROWTH_HACK:
      description = `"${object.name}" has been ${action}d`;

      extraDesc = await gatherGHFieldNames(models, subdomain, object);

      if (updatedDocument) {
        extraDesc = await gatherGHFieldNames(
          models,
          subdomain,
          updatedDocument,
          extraDesc
        );
      }

      break;
    case MODULE_NAMES.PIPELINE_LABEL:
      description = `"${object.name}" has been ${action}d`;

      const pipeline = await models.Pipelines.findOne({
        _id: object.pipelineId
      });

      extraDesc = await gatherUsernames({
        foreignKey: 'createdBy',
        items: await findUsers(subdomain, [object.createdBy])
      });

      if (pipeline) {
        extraDesc.push({ pipelineId: pipeline._id, name: pipeline.name });
      }

      break;
    case MODULE_NAMES.PIPELINE_TEMPLATE:
      extraDesc = await gatherPipelineTemplateFieldNames(subdomain, object);

      description = `"${object.name}" has been created`;

      if (updatedDocument) {
        extraDesc = await gatherPipelineTemplateFieldNames(
          subdomain,
          updatedDocument,
          extraDesc
        );
      }

      break;
    case MODULE_NAMES.TASK:
      description = `"${object.name}" has been ${action}d`;

      extraDesc = await gatherBoardItemFieldNames(models, subdomain, object);

      if (updatedDocument) {
        extraDesc = await gatherBoardItemFieldNames(
          models,
          subdomain,
          updatedDocument,
          extraDesc
        );
      }

      break;
    case MODULE_NAMES.TICKET:
      description = `"${object.name}" has been ${action}d`;

      extraDesc = await gatherBoardItemFieldNames(models, subdomain, object);

      if (updatedDocument) {
        extraDesc = await gatherBoardItemFieldNames(
          models,
          subdomain,
          updatedDocument,
          extraDesc
        );
      }

      break;
    case MODULE_NAMES.STAGE_DEAL:
    case MODULE_NAMES.STAGE_PURCHASE:
    case MODULE_NAMES.STAGE_TASK:
    case MODULE_NAMES.STAGE_TICKET:
    case MODULE_NAMES.STAGE_GH:
      description = `"${object.name}" has been ${action}d`;

      extraDesc = await gatherStageFieldNames(
        models,
        subdomain,
        object,
        extraDesc
      );

      if (updatedDocument) {
        extraDesc = await gatherStageFieldNames(
          models,
          subdomain,
          updatedDocument,
          extraDesc
        );
      }

      break;

    case MODULE_NAMES.CHECKLIST:
      const itemName = await findItemName(models, {
        contentType: object.contentType,
        contentTypeId: object.contentTypeId
      });

      extraDesc = await gatherUsernames({
        foreignKey: 'createdUserId',
        items: await findUsers(subdomain, [object.createdUserId])
      });

      extraDesc.push({ contentTypeId: object.contentTypeId, name: itemName });

      if (action === LOG_ACTIONS.CREATE) {
        description = `"${
          object.title
        }" has been created in ${object.contentType.toUpperCase()} "${itemName}"`;
      }
      if (action === LOG_ACTIONS.UPDATE) {
        description = `"${
          object.title
        }" saved in ${object.contentType.toUpperCase()} "${itemName}" has been edited`;
      }
      if (action === LOG_ACTIONS.DELETE) {
        description = `"${
          object.title
        }" from ${object.contentType.toUpperCase()} "${itemName}" has been removed`;
      }

      break;
    case MODULE_NAMES.CHECKLIST_ITEM:
      const checklist = await models.Checklists.getChecklist(
        object.checklistId
      );

      extraDesc = await gatherUsernames({
        foreignKey: 'createdUserid',
        items: await findUsers(subdomain, [object.createdUserId])
      });

      extraDesc.push({ checklistId: checklist._id, name: checklist.title });

      if (action === LOG_ACTIONS.CREATE) {
        description = `"${object.content}" has been added to "${checklist.title}"`;
      }
      if (action === LOG_ACTIONS.UPDATE) {
        description = `"${object.content}" has been edited /checked/`;
      }
      if (action === LOG_ACTIONS.DELETE) {
        description = `"${object.content}" has been removed from "${checklist.title}"`;
      }

      break;

    default:
      break;
  }

  return { extraDesc, description };
};

export const putDeleteLog = async (
  models: IModels,
  subdomain: string,
  logDoc,
  user
) => {
  const { description, extraDesc } = await gatherDescriptions(
    models,
    subdomain,
    {
      ...logDoc,
      action: LOG_ACTIONS.DELETE
    }
  );

  await commonPutDeleteLog(
    subdomain,
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `cards:${logDoc.type}` },
    user
  );
};

export const putUpdateLog = async (
  models: IModels,
  subdomain: string,
  logDoc,
  user
) => {
  const { description, extraDesc } = await gatherDescriptions(
    models,
    subdomain,
    {
      ...logDoc,
      action: LOG_ACTIONS.UPDATE
    }
  );

  await commonPutUpdateLog(
    subdomain,
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `cards:${logDoc.type}` },
    user
  );
};

export const putCreateLog = async (
  models: IModels,
  subdomain: string,
  logDoc,
  user
) => {
  const { description, extraDesc } = await gatherDescriptions(
    models,
    subdomain,
    {
      ...logDoc,
      action: LOG_ACTIONS.CREATE
    }
  );

  await commonPutCreateLog(
    subdomain,
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `cards:${logDoc.type}` },
    user
  );
};

export const putActivityLog = async (
  subdomain,
  params: { action: string; data: any }
) => {
  const { data, action } = params;

  const updatedParams = {
    ...params,
    data: { ...data, contentType: `cards:${data.contentType}` }
  };

  if (action === 'createBoardItemMovementLog') {
    await sendToWebhook({
      subdomain,
      data: {
        action,
        type: `cards:${data.contentType}`,
        params
      }
    });
  }

  return commonPutActivityLog(subdomain, {
    messageBroker: messageBroker(),
    ...updatedParams
  });
};

export const putChecklistActivityLog = async (subdomain: string, params) => {
  const { action, item } = params;

  const updatedParams = {
    action: 'createChecklistLog',
    data: {
      ...params,
      contentId: item.contentTypeId || item.checklistId,
      content: { _id: item._id, name: item.title || item.content },
      createdBy: item.createdUserId || ''
    }
  };

  if (action === 'delete') {
    sendLogsMessage({
      subdomain,
      action: 'activityLogs.updateMany',
      data: {
        query: { 'content._id': item._id },
        modifier: { $set: { 'content.name': item.title || item.content } }
      }
    });
  }

  return putActivityLog(subdomain, updatedParams);
};

const sendSuccess = data => ({
  data,
  status: 'success'
});

export default {
  getActivityContent: async ({ subdomain, data }) => {
    return getContentItem(subdomain, data);
  },

  getContentTypeDetail: async ({ subdomain, data }) => {
    return getContentTypeDetail(subdomain, data);
  },

  collectItems: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return sendSuccess(await collectItems(models, subdomain, data));
  },

  getContentIds: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return sendSuccess(await getCardContentIds(models, data));
  },

  getSchemaLabels: ({ data: { type } }) => {
    return sendSuccess(getSchemaLabels(type, LOG_MAPPINGS));
  }
};
