import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  putActivityLog as commonPutActivityLog,
  getSchemaLabels,
  IDescriptions
} from '@erxes/api-utils/src/logUtils';
import { IModels } from './connectionResolver';

import messageBroker from './messageBroker';
import { donateCampaignSchema } from './models/definitions/donateCampaigns';

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

const gatherDescriptions = async (
  models: IModels,
  params: any
): Promise<IDescriptions> => {
  const { action, object } = params;

  const description = `"${object.name}" has been ${action}d`;

  return { description };
};

export const putDeleteLog = async (models, subdomain, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(models, {
    ...logDoc,
    action: LOG_ACTIONS.DELETE
  });

  await commonPutDeleteLog(
    subdomain,
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `${logDoc.type}` },
    user
  );
};

export const putUpdateLog = async (models, subdomain, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(models, {
    ...logDoc,
    action: LOG_ACTIONS.UPDATE
  });

  await commonPutUpdateLog(
    subdomain,
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `${logDoc.type}` },
    user
  );
};

export const putCreateLog = async (models, subdomain, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(models, {
    ...logDoc,
    action: LOG_ACTIONS.CREATE
  });

  await commonPutCreateLog(
    subdomain,
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `${logDoc.type}` },
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
    data: { ...data, contentType: `${data.contentType}` }
  };

  return commonPutActivityLog(subdomain, {
    messageBroker: messageBroker(),
    ...updatedParams
  });
};

export default {
  getSchemaLabels: ({ data: { type } }) => ({
    status: 'success',
    data: getSchemaLabels(type, [
      { name: 'donateCampaign', schemas: [donateCampaignSchema] }
      // { name: 'productCategory', schemas: [productCategorySchema] }
    ])
  })
};
