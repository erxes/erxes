import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  LogDesc,
  gatherNames,
  IDescriptions,
  getSchemaLabels
} from '@erxes/api-utils/src/logUtils';

import { IModels } from './connectionResolver';
import messageBroker from './messageBroker';
import { pricingPlanSchema } from './models/definitions/pricingPlan';

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

const gatherDescriptions = async (
  _args,
  _args1,
  params: any
): Promise<IDescriptions> => {
  const { action, object } = params;

  const extraDesc: LogDesc[] = [];
  const description = `"${object.name}" has been ${action}d`;

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
    { ...logDoc, description, extraDesc, type: `pricing:${logDoc.type}` },
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
    { ...logDoc, description, extraDesc, type: `pricing:${logDoc.type}` },
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
    { ...logDoc, description, extraDesc, type: `pricing:${logDoc.type}` },
    user
  );
};

export default {
  getSchemaLabels: ({ data: { type } }) => ({
    status: 'success',
    data: getSchemaLabels(type, [
      { name: 'pricingPlan', schemas: [pricingPlanSchema] }
    ])
  })
};
