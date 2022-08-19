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
import { ICompanyDocument } from './models/definitions/companies';
import messageBroker, {
  sendCoreMessage,
  sendInboxMessage,
  sendTagsMessage
} from './messageBroker';
import { LOG_MAPPINGS, MODULE_NAMES } from './constants';
import { ICustomerDocument } from './models/definitions/customers';
import { IModels } from './connectionResolver';

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

const findUsers = async (subdomain, ids: string[]) => {
  return (
    sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: {
          _id: { $in: ids }
        }
      },
      isRPC: true,
      defaultValue: []
    }) || []
  );
};

const gatherCompanyFieldNames = async (
  models: IModels,
  subdomain: string,
  doc: ICompanyDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.parentCompanyId) {
    options = await gatherNames({
      foreignKey: 'parentCompanyId',
      prevList: options,
      nameFields: ['primaryName'],
      items: await models.Companies.find({
        _id: { $in: [doc.parentCompanyId] }
      }).lean()
    });
  }

  if (doc.ownerId) {
    options = await gatherUsernames({
      foreignKey: 'ownerId',
      prevList: options,
      items: await findUsers(subdomain, [doc.ownerId])
    });
  }

  if (doc.mergedIds && doc.mergedIds.length > 0) {
    options = await gatherNames({
      foreignKey: 'mergedIds',
      prevList: options,
      nameFields: ['primaryName'],
      items: await models.Companies.find({ _id: { $in: doc.mergedIds } }).lean()
    });
  }

  if (doc.tagIds && doc.tagIds.length > 0) {
    options = await gatherNames({
      foreignKey: 'tagIds',
      prevList: options,
      nameFields: ['name'],
      items: await sendTagsMessage({
        subdomain,
        action: 'find',
        data: { _id: { $in: doc.tagIds } },
        isRPC: true
      })
    });
  }

  return options;
};

const gatherCustomerFieldNames = async (
  models: IModels,
  subdomain: string,
  doc: ICustomerDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.ownerId) {
    options = await gatherUsernames({
      foreignKey: 'ownerId',
      prevList: options,
      items: await findUsers(subdomain, [doc.ownerId])
    });
  }

  if (doc.integrationId) {
    options = await gatherNames({
      foreignKey: 'integrationId',
      prevList: options,
      nameFields: ['name'],
      items: await sendInboxMessage({
        subdomain,
        action: 'integrations.find',
        data: { _id: { $in: [doc.integrationId] } },
        isRPC: true
      })
    });
  }

  if (doc.tagIds && doc.tagIds.length > 0) {
    options = await gatherNames({
      foreignKey: 'tagIds',
      prevList: options,
      nameFields: ['name'],
      items: await sendTagsMessage({
        subdomain,
        action: 'find',
        data: { _id: { $in: doc.tagIds } }
      })
    });
  }

  if (doc.mergedIds) {
    options = await gatherNames({
      foreignKey: 'mergedIds',
      prevList: options,
      nameFields: ['firstName'],
      items: await models.Customers.find({ _id: { $in: doc.mergedIds } }).lean()
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
  let description: string = '';

  switch (type) {
    case MODULE_NAMES.COMPANY:
      extraDesc = await gatherCompanyFieldNames(models, subdomain, object);

      if (updatedDocument) {
        extraDesc = await gatherCompanyFieldNames(
          models,
          subdomain,
          updatedDocument,
          extraDesc
        );
      }

      description = `"${object.primaryName}" has been ${action}d`;
      break;
    case MODULE_NAMES.CUSTOMER:
      extraDesc = await gatherCustomerFieldNames(models, subdomain, object);

      if (updatedDocument) {
        extraDesc = await gatherCustomerFieldNames(
          models,
          subdomain,
          updatedDocument,
          extraDesc
        );
      }

      description = `"${object.firstName ||
        object.lastName ||
        object.middleName}" has been ${action}d`;
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
    { ...logDoc, description, extraDesc, type: `contacts:${logDoc.type}` },
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
    { ...logDoc, description, extraDesc, type: `contacts:${logDoc.type}` },
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
    { ...logDoc, description, extraDesc, type: `contacts:${logDoc.type}` },
    user
  );
};

export const putActivityLog = async (
  subdomain: string,
  params: { action: string; data: any }
) => {
  const { data } = params;

  const updatedParams = {
    ...params,
    subdomain,
    data: { ...data, contentType: `contacts:${data.contentType}` }
  };

  return commonPutActivityLog(subdomain, {
    messageBroker: messageBroker(),
    ...updatedParams
  });
};

export const prepareCocLogData = coc => {
  // condition logic was in ActivityLogs model before
  let action = 'create';
  let content: string[] = [];

  if (coc.mergedIds && coc.mergedIds.length > 0) {
    action = 'merge';
    content = coc.mergedIds;
  }

  return {
    createdBy: coc.ownerId || coc.integrationId,
    action,
    content,
    contentId: coc._id
  };
};

export default {
  getSchemaLabels: ({ data: { type } }) => ({
    status: 'success',
    data: getSchemaLabels(type, LOG_MAPPINGS)
  })
};
