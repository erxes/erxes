import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  putActivityLog as commonPutActivityLog,
  LogDesc,
  gatherUsernames,
  IDescriptions,
  getSchemaLabels
} from '@erxes/api-utils/src/logUtils';
import messageBroker from './messageBroker';
import { LOG_MAPPINGS, MODULE_NAMES } from './constants';
import { IModels } from './connectionResolver';
import { IUserDocument } from './models/definitions/clientPortalUser';

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

const findUsers = async (models: IModels, ids: string[]) => {
  const userInfo = await models.ClientPortalUsers.findOne({
    clientPortalId: ids
  });
  return userInfo;
};

const gatherCustomerFieldNames = async (
  models: IModels,
  doc: IUserDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.clientPortalId) {
    const docItems = await findUsers(models, [doc.clientPortalId]);

    options = await gatherUsernames({
      foreignKey: 'clientPortalId',
      prevList: options,
      items: [docItems]
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
    case MODULE_NAMES.CUSTOMER:
      extraDesc = await gatherCustomerFieldNames(models, object);

      if (updatedDocument) {
        extraDesc = await gatherCustomerFieldNames(
          models,
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
    { ...logDoc, description, extraDesc, type: `clientportal:${logDoc.type}` },
    user
  );
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
    { ...logDoc, description, extraDesc, type: `clientportal:${logDoc.type}` },
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
    { ...logDoc, description, extraDesc, type: `clientportal:${logDoc.type}` },
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
    data: { ...data, contentType: `clientportal:${data.contentType}` }
  };

  return commonPutActivityLog(subdomain, {
    messageBroker: messageBroker(),
    ...updatedParams
  });
};

export default {
  getSchemaLabels: ({ data: { type } }) => ({
    status: 'success',
    data: getSchemaLabels(type, LOG_MAPPINGS)
  })
};
