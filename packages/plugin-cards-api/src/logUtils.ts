import {
  Boards,
  PipelineLabels,
  Pipelines,
  Stages,
  Deals,
  Tasks,
  Tickets,
  Checklists,
  GrowthHacks,
} from './models';
import { IPipelineDocument, IStageDocument } from './models/definitions/boards';
import { IDealDocument } from './models/definitions/deals';
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
} from '@erxes/api-utils/src/logUtils';
import { ITaskDocument } from './models/definitions/tasks';
import { ITicketDocument } from './models/definitions/tickets';
import messageBroker, { findMongoDocuments, findProducts } from './messageBroker';
import { MODULE_NAMES } from './constants';
import { ACTIVITY_CONTENT_TYPES } from './models/definitions/constants';

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

type BoardItemDocument = IDealDocument | ITaskDocument | ITicketDocument | IGrowthHackDocument;

const findUsers = async (ids: string[]) => {
  return await findMongoDocuments('api-core', { query: { _id: { $in: ids } }, name: 'Users' })
};

const gatherPipelineFieldNames = async (
  doc: IPipelineDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

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
      items: await findUsers([doc.userId])
    });
  }

  if (doc.excludeCheckUserIds && doc.excludeCheckUserIds.length > 0) {
    options = await gatherUsernames({
      foreignKey: 'excludeCheckUserIds',
      prevList: options,
      items: await findUsers(doc.excludeCheckUserIds)
    });
  }

  if (doc.memberIds && doc.memberIds.length > 0) {
    options = await gatherUsernames({
      foreignKey: 'memberIds',
      prevList: options,
      items: await findUsers(doc.memberIds)
    });
  }

  if (doc.watchedUserIds && doc.watchedUserIds.length > 0) {
    options = await gatherUsernames({
      foreignKey: 'watchedUserIds',
      prevList: options,
      items: await findUsers(doc.watchedUserIds)
    });
  }

  return options;
};

const gatherBoardItemFieldNames = async (
  doc: BoardItemDocument,
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
      items: await findUsers([doc.userId])
    });
  }

  if (doc.assignedUserIds && doc.assignedUserIds.length > 0) {
    options = await gatherUsernames({
      foreignKey: 'assignedUserIds',
      prevList: options,
      items: await findUsers(doc.assignedUserIds)
    });
  }

  if (doc.watchedUserIds && doc.watchedUserIds.length > 0) {
    options = await gatherUsernames({
      foreignKey: 'watchedUserIds',
      prevList: options,
      items: await findUsers(doc.watchedUserIds)
    });
  }

  if (doc.labelIds && doc.labelIds.length > 0) {
    options = await gatherNames({
      foreignKey: 'labelIds',
      prevList: options,
      nameFields: ['name'],
      items: await PipelineLabels.find({ _id: { $in: doc.labelIds} }).lean()
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
      items: await findUsers([doc.modifiedBy])
    });
  }

  return options;
};

const gatherDealFieldNames = async (
  doc: IDealDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  options = await gatherBoardItemFieldNames(doc, options);

  if (doc.productsData && doc.productsData.length > 0) {
    options = await gatherNames({
      foreignKey: 'productId',
      prevList: options,
      nameFields: ['name'],
      items: await findProducts(
        'find',
        { _id: { $in: doc.productsData.map(p => p.productId) } }
      )
    });
  }

  return options;
};

const gatherGHFieldNames = async (
  doc: IGrowthHackDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  options = await gatherBoardItemFieldNames(doc, options);

  if (doc.votedUserIds && doc.votedUserIds.length > 0) {
    options = await gatherUsernames({
      foreignKey: 'votedUserIds',
      prevList: options,
      items: await findUsers(doc.votedUserIds)
    });
  }

  return options;
};

const gatherPipelineTemplateFieldNames = async (
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
    items: await findUsers([doc.createdBy || ''])
  });

  if (doc.stages && doc.stages.length > 0) {
    options = await gatherNames({
      foreignKey: 'formId',
      prevList: options,
      nameFields: ['title'],
      items: await findMongoDocuments(
        'api-core',
        { query: { _id: { $in: doc.stages.map((s) => s.formId) } }, name: 'Forms' }
      )
    });
  }

  return options;
};

const gatherStageFieldNames = async (
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
      items: await findUsers([doc.userId])
    });
  }
  if (doc.pipelineId) {
    options = await gatherNames({
      foreignKey: 'pipelineId',
      prevList: options,
      nameFields: ['name'],
      items: await Pipelines.find({ _id: doc.pipelineId })
    });
  }
  if (doc.formId) {
    options = await gatherNames({
      foreignKey: 'formId',
      prevList: options,
      nameFields: ['title'],
      items: await findMongoDocuments(
        'api-core',
        { query: { _id: { $in: [doc.formId] } }, name: 'Forms' }
      )
    });
  }

  return options;
};

interface IContentTypeParams {
  contentType: string;
  contentTypeId: string;
}

const findItemName = async ({
  contentType,
  contentTypeId,
}: IContentTypeParams): Promise<string> => {
  let item: any;
  let name: string = '';

  if (contentType === ACTIVITY_CONTENT_TYPES.DEAL) {
    item = await Deals.findOne({ _id: contentTypeId });
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

const gatherDescriptions = async (params: any): Promise<IDescriptions> => {
  const { action, type, object, updatedDocument } = params;

  let extraDesc: LogDesc[] = [];
  let description: string = '';

  switch (type) {
    case MODULE_NAMES.BOARD_DEAL:
    case MODULE_NAMES.BOARD_GH:
    case MODULE_NAMES.BOARD_TASK:
    case MODULE_NAMES.BOARD_TICKET:
      if (object.userId) {
        extraDesc = await gatherUsernames({
          foreignKey: 'userId',
          items: await findUsers([object.userId])
        });
      }

      description = `"${object.name}" has been ${action}d`;

      break;
    case MODULE_NAMES.PIPELINE_DEAL:
    case MODULE_NAMES.PIPELINE_GH:
    case MODULE_NAMES.PIPELINE_TASK:
    case MODULE_NAMES.PIPELINE_TICKET:
      extraDesc = await gatherPipelineFieldNames(object);

      if (updatedDocument) {
        extraDesc = await gatherPipelineFieldNames(updatedDocument, extraDesc);
      }

      description = `"${object.name}" has been ${action}d`;

      break;
    case MODULE_NAMES.DEAL:
      description = `"${object.name}" has been ${action}d`;
      extraDesc = await gatherDealFieldNames(object);

      if (updatedDocument) {
        extraDesc = await gatherDealFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.GROWTH_HACK:
      description = `"${object.name}" has been ${action}d`;

      extraDesc = await gatherGHFieldNames(object);

      if (updatedDocument) {
        extraDesc = await gatherGHFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.PIPELINE_LABEL:
      description = `"${object.name}" has been ${action}d`;

      const pipeline = await Pipelines.findOne({ _id: object.pipelineId });

      extraDesc = await gatherUsernames({
        foreignKey: 'createdBy',
        items: await findUsers([object.createdBy])
      });

      if (pipeline) {
        extraDesc.push({ pipelineId: pipeline._id, name: pipeline.name });
      }

      break;
    case MODULE_NAMES.PIPELINE_TEMPLATE:
      extraDesc = await gatherPipelineTemplateFieldNames(object);

      description = `"${object.name}" has been created`;

      if (updatedDocument) {
        extraDesc = await gatherPipelineTemplateFieldNames(
          updatedDocument,
          extraDesc
        );
      }

      break;
    case MODULE_NAMES.TASK:
      description = `"${object.name}" has been ${action}d`;

      extraDesc = await gatherBoardItemFieldNames(object);

      if (updatedDocument) {
        extraDesc = await gatherBoardItemFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.TICKET:
      description = `"${object.name}" has been ${action}d`;

      extraDesc = await gatherBoardItemFieldNames(object);

      if (updatedDocument) {
        extraDesc = await gatherBoardItemFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.STAGE_DEAL:
    case MODULE_NAMES.STAGE_TASK:
    case MODULE_NAMES.STAGE_TICKET:
    case MODULE_NAMES.STAGE_GH:
      description = `"${object.name}" has been ${action}d`;

      extraDesc = await gatherStageFieldNames(object, extraDesc);

      if (updatedDocument) {
        extraDesc = await gatherStageFieldNames(updatedDocument, extraDesc);
      }

      break;

    case MODULE_NAMES.CHECKLIST:
      const itemName = await findItemName({
        contentType: object.contentType,
        contentTypeId: object.contentTypeId,
      });

      extraDesc = await gatherUsernames({
        foreignKey: 'createdUserId',
        items: await findUsers([object.createdUserId])
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
      const checklist = await Checklists.getChecklist(object.checklistId);

      extraDesc = await gatherUsernames({
        foreignKey: 'createdUserid',
        items: await findUsers([object.createdUserId])
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

export const putDeleteLog = async (logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions({
    ...logDoc,
    action: LOG_ACTIONS.DELETE,
  });

  await commonPutDeleteLog(
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `cards:${logDoc.type}` },
    user
  );
};

export const putUpdateLog = async (logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions({
    ...logDoc,
    action: LOG_ACTIONS.UPDATE,
  });

  await commonPutUpdateLog(
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `cards:${logDoc.type}` },
    user
  );
};

export const putCreateLog = async (logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions({
    ...logDoc,
    action: LOG_ACTIONS.CREATE,
  });

  await commonPutCreateLog(
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `cards:${logDoc.type}` },
    user
  );
};

export const putActivityLog = async (params: { action: string; data: any }) => {
  const { data } = params;

  // if (['createBoardItemMovementLog'].includes(action)) {
  //   await sendToWebhook(action, data.contentType, params);
  // }

  const updatedParams = { ...params, data: { ...data, contentType: `cards:${data.contentType}` } };

  return commonPutActivityLog({ messageBroker: messageBroker(), ...updatedParams });
};
