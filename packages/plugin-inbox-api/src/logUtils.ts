import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  LogDesc,
  IDescriptions,
  gatherNames,
  getSchemaLabels
} from '@erxes/api-utils/src/logUtils';
import messageBroker, {
  sendCoreMessage,
  sendFormsMessage,
  sendTagsMessage
} from './messageBroker';
import { LOG_MAPPINGS, MODULE_NAMES } from './constants';
import { IModels } from './connectionResolver';
import { collectConversations } from './receiveMessage';
import { IChannelDocument } from './models/definitions/channels';
import { IIntegrationDocument } from './models/definitions/integrations';

const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

const findFromCore = async (
  subdomain: string,
  ids: string[],
  collectionName: string
) => {
  return sendCoreMessage({
    subdomain,
    action: `${collectionName}.find`,
    data: {
      query: { _id: { $in: ids } }
    },
    isRPC: true,
    defaultValue: []
  });
};

const findTags = async (subdomain: string, ids: string[]) => {
  return sendTagsMessage({
    subdomain,
    action: 'find',
    data: {
      _id: { $in: ids }
    },
    isRPC: true,
    defaultValue: []
  });
};

const findForms = async (subdomain: string, ids: string[]) => {
  return sendFormsMessage({
    subdomain,
    action: 'find',
    data: {
      query: { _id: { $in: ids } }
    },
    isRPC: true,
    defaultValue: []
  });
};

export const gatherIntegrationFieldNames = async (
  subdomain: string,
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
      items: await findFromCore(subdomain, [doc.createdUserId], 'users')
    });
  }

  if (doc.brandId) {
    options = await gatherNames({
      foreignKey: 'brandId',
      prevList: options,
      nameFields: ['name'],
      items: await findFromCore(subdomain, [doc.brandId], 'brands')
    });
  }

  if (doc.tagIds && doc.tagIds.length > 0) {
    options = await gatherNames({
      foreignKey: 'tagIds',
      prevList: options,
      nameFields: ['name'],
      items: await findTags(subdomain, doc.tagIds)
    });
  }

  if (doc.formId) {
    options = await gatherNames({
      foreignKey: 'formId',
      prevList: options,
      nameFields: ['title'],
      items: await findForms(subdomain, [doc.formId])
    });
  }

  return options;
};

export const gatherChannelFieldNames = async (
  models: IModels,
  subdomain: string,
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
      items: await findFromCore(subdomain, [doc.userId], 'users')
    });
  }

  if (doc.memberIds && doc.memberIds.length > 0) {
    options = await gatherNames({
      nameFields: ['memberIds'],
      foreignKey: 'memberIds',
      prevList: options,
      items: await findFromCore(subdomain, doc.memberIds, 'users')
    });
  }

  if (doc.integrationIds && doc.integrationIds.length > 0) {
    options = await gatherNames({
      foreignKey: 'integrationIds',
      prevList: options,
      nameFields: ['name'],
      items: await models.Integrations.findIntegrations({
        _id: { $in: doc.integrationIds }
      })
    });
  }

  return options;
};

const gatherDescriptions = async (
  models: IModels,
  subdomain: string,
  params: any
): Promise<IDescriptions> => {
  const { action, type, object, updatedDocument } = params;

  let extraDesc: LogDesc[] = [];
  const description = `"${object.name}" has been ${action}d`;

  switch (type) {
    case MODULE_NAMES.CHANNEL:
      extraDesc = await gatherChannelFieldNames(models, subdomain, object);

      if (updatedDocument) {
        extraDesc = await gatherChannelFieldNames(
          models,
          subdomain,
          updatedDocument,
          extraDesc
        );
      }

      break;
    case MODULE_NAMES.INTEGRATION:
      extraDesc = await gatherIntegrationFieldNames(subdomain, object);

      if (updatedDocument) {
        extraDesc = await gatherIntegrationFieldNames(
          subdomain,
          updatedDocument,
          extraDesc
        );
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
          items: await findFromCore(subdomain, brandIds, 'brands')
        });
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
    { ...logDoc, description, extraDesc, type: `inbox:${logDoc.type}` },
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
    { ...logDoc, description, extraDesc, type: `inbox:${logDoc.type}` },
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
