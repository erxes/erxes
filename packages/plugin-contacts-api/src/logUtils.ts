import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  LogDesc,
  gatherNames,
  gatherUsernames,
  IDescriptions,
} from '@erxes/api-utils/src/logUtils';
import { ICompanyDocument } from './models/definitions/companies';
import messageBroker, { findIntegrations, findTags } from './messageBroker';
import { MODULE_NAMES } from './constants';
import Companies from './models/Companies';
import { ICustomerDocument } from './models/definitions/customers';
import Customers from './models/Customers';

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

const findUsers = async (ids: string[]) => {
  return await messageBroker().sendRPCMessage('api-core', { query: { _id: { $in: ids } }, name: 'Users' })
};

const gatherCompanyFieldNames = async (
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
      items: await Companies.find({ _id: { $in: [doc.parentCompanyId] } }).lean()
    });
  }

  if (doc.ownerId) {
    options = await gatherUsernames({
      foreignKey: 'ownerId',
      prevList: options,
      items: await findUsers([doc.ownerId])
    });
  }

  if (doc.mergedIds && doc.mergedIds.length > 0) {
    options = await gatherNames({
      foreignKey: 'mergedIds',
      prevList: options,
      nameFields: ['primaryName'],
      items: await Companies.find({ _id: { $in: doc.mergedIds} }).lean()
    });
  }

  if (doc.tagIds && doc.tagIds.length > 0) {
    options = await gatherNames({
      foreignKey: 'tagIds',
      prevList: options,
      nameFields: ['name'],
      items: await findTags({ _id: { $in: doc.tagIds } })
    });
  }

  return options;
};

const gatherCustomerFieldNames = async (
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
      items: await findUsers([doc.ownerId])
    });
  }

  if (doc.integrationId) {
    options = await gatherNames({
      foreignKey: 'integrationId',
      prevList: options,
      nameFields: ['name'],
      items: await findIntegrations({ _id: { $in: [doc.integrationId] } }),
    });
  }

  if (doc.tagIds && doc.tagIds.length > 0) {
    options = await gatherNames({
      foreignKey: 'tagIds',
      prevList: options,
      nameFields: ['name'],
      items: await findTags({ _id: { $in: doc.tagIds } })
    });
  }

  if (doc.mergedIds) {
    options = await gatherNames({
      foreignKey: 'mergedIds',
      prevList: options,
      nameFields: ['firstName'],
      items: await Customers.find({ _id: { $in: doc.mergedIds } }).lean()
    });
  }

  return options;
};

const gatherDescriptions = async (params: any): Promise<IDescriptions> => {
  const { action, type, object, updatedDocument } = params;

  let extraDesc: LogDesc[] = [];
  let description: string = '';

  switch (type) {
    case MODULE_NAMES.COMPANY:
      extraDesc = await gatherCompanyFieldNames(object);

      if (updatedDocument) {
        extraDesc = await gatherCompanyFieldNames(updatedDocument, extraDesc);
      }

      description = `"${object.primaryName}" has been ${action}d`;
      break;
    case MODULE_NAMES.CUSTOMER:
      extraDesc = await gatherCustomerFieldNames(object);
     
      if (updatedDocument) {
        extraDesc = await gatherCustomerFieldNames(updatedDocument, extraDesc);
      }

      description = `"${object.firstName || object.lastName || object.middleName}" has been ${action}d`;
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
    { ...logDoc, description, extraDesc, type: `contacts:${logDoc.type}` },
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
    { ...logDoc, description, extraDesc, type: `contacts:${logDoc.type}` },
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
    { ...logDoc, description, extraDesc, type: `contacts:${logDoc.type}` },
    user
  );
};
