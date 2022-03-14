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
import { gatherChannelFieldNames, gatherIntegrationFieldNames, findFromCore } from './logHelper';
import { IModels } from './connectionResolver';
import { collectConversations } from "./receiveMessage";

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
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
