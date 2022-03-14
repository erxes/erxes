import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  LogDesc,
  IDescriptions,
  gatherNames,
  getSchemaLabels
} from '@erxes/api-utils/src/logUtils';
import messageBroker from './messageBroker';
import { LOG_MAPPINGS, MODULE_NAMES } from './constants';
import { IModels } from './connectionResolver';
import { collectConversations } from "./receiveMessage";
import { IChannelDocument } from "./models/definitions/channels";
import { IIntegrationDocument } from "./models/definitions/integrations";

const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

const findFromCore = async (ids: string[], collectionName: string) => {
  return messageBroker().sendRPCMessage(
    `core:${collectionName}.find`,
    { data: { query: { _id: { $in: ids } } } }
  ) || [];
};

const findTags = async (ids: string[]) => {
  return messageBroker().sendRPCMessage('tags:find', { data: { _id: { $in: ids } } }) || [];
};

const findForms = async (ids: string[]) => {
  return messageBroker().sendRPCMessage('forms:find', { data: { query: { _id: { $in: ids } } } }) || [];
};

export const gatherIntegrationFieldNames = async (
  doc: IIntegrationDocument,
  prevList?: LogDesc[]
) => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.createdUserId) {
    options = await gatherNames({
      nameFields: ['email', 'username'],
      foreignKey: 'createdUserId',
      prevList: options,
      items: await findFromCore([doc.createdUserId], 'users')
    });
  }

  if (doc.brandId) {
    options = await gatherNames({
      foreignKey: 'brandId',
      prevList: options,
      nameFields: ['name'],
      items: await findFromCore([doc.brandId], 'brands')
    });
  }

  if (doc.tagIds && doc.tagIds.length > 0) {
    options = await gatherNames({
      foreignKey: 'tagIds',
      prevList: options,
      nameFields: ['name'],
      items: await findTags(doc.tagIds)
    });
  }

  if (doc.formId) {
    options = await gatherNames({
      foreignKey: 'formId',
      prevList: options,
      nameFields: ['title'],
      items: await findForms([doc.formId])
    });
  }

  return options;
};

export const gatherChannelFieldNames = async (
  models: IModels,
  doc: IChannelDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.userId) {
    options = await gatherNames({
      nameFields: ['userId'],
      foreignKey: 'userId',
      prevList: options,
      items: await findFromCore([doc.userId], 'users')
    });
  }

  if (doc.memberIds && doc.memberIds.length > 0) {
    options = await gatherNames({
      nameFields: ['memberIds'],
      foreignKey: 'memberIds',
      prevList: options,
      items: await findFromCore(doc.memberIds, 'users')
    });
  }

  if (doc.integrationIds && doc.integrationIds.length > 0) {
    options = await gatherNames({
      foreignKey: 'integrationIds',
      prevList: options,
      nameFields: ['name'],
      items: await models.Integrations.findIntegrations({ _id: { $in: doc.integrationIds } })
    });
  }

  return options;
};

const gatherDescriptions = async (models: IModels, params: any): Promise<IDescriptions> => {
  const { action, type, object, updatedDocument } = params;

  let extraDesc: LogDesc[] = [];
  const description = `"${object.name}" has been ${action}d`;

  switch (type) {
    case MODULE_NAMES.CHANNEL:
      extraDesc = await gatherChannelFieldNames(models, object);

      if (updatedDocument) {
        extraDesc = await gatherChannelFieldNames(models, updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.INTEGRATION:
      extraDesc = await gatherIntegrationFieldNames(object);

      if (updatedDocument) {
        extraDesc = await gatherIntegrationFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.RESPONSE_TEMPLATE:
      const brandIds: string[] = [];

      if (object.brandId) {
        brandIds.push(object.brandId);
      }

      if (
        updatedDocument &&
        updatedDocument.brandId &&
        updatedDocument.brandId !== object.brandId
      ) {
        brandIds.push(updatedDocument.brandId);
      }

      if (brandIds.length > 0) {
        extraDesc = await gatherNames({
          nameFields: ['name'],
          foreignKey: 'brandId',
          items: await findFromCore(brandIds, 'brands')
        });
      }

      break;
    default:
      break;
  }

  return { extraDesc, description };
};

export const putDeleteLog = async (models: IModels, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(models, {
    ...logDoc,
    action: LOG_ACTIONS.DELETE,
  });

  await commonPutDeleteLog(
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `inbox:${logDoc.type}` },
    user
  );
};

export const putUpdateLog = async (models: IModels, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(models, {
    ...logDoc,
    action: LOG_ACTIONS.UPDATE,
  });

  await commonPutUpdateLog(
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `inbox:${logDoc.type}` },
    user
  );
};

export const putCreateLog = async (models: IModels, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(models, {
    ...logDoc,
    action: LOG_ACTIONS.CREATE,
  });

  await commonPutCreateLog(
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `inbox:${logDoc.type}` },
    user
  );
};

export default {
  collectItems: async ({ data }) => ({
    data: await collectConversations(data),
    status: 'success'
  }),
  getSchemaLabels: ({ data: { type } }) => ({
    status: 'success',
    data: getSchemaLabels(type, LOG_MAPPINGS)
  })
};
