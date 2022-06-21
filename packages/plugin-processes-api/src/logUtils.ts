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
import { jobReferSchema } from './models/definitions/jobs';
import { jobCategorySchema } from './models/definitions/jobCategories';
import { flowCategorySchema } from './models/definitions/flowCategories';
import { flowSchema } from './models/definitions/flows';

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

export const MODULE_NAMES = {
  PRODUCT: 'product',
  PRODUCT_CATEGORY: 'productCategory',
  WORK: 'work',
  OVERALWORK: 'overalWork'
};

const gatherDescriptions = async (
  models: IModels,
  subdomain: string,
  params: any
): Promise<IDescriptions> => {
  const { action, type, object, updatedDocument } = params;

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
    { ...logDoc, description, extraDesc, type: `products:${logDoc.type}` },
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
    { ...logDoc, description, extraDesc, type: `products:${logDoc.type}` },
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
    { ...logDoc, description, extraDesc, type: `products:${logDoc.type}` },
    user
  );
};

export default {
  getSchemaLabels: ({ data: { type } }) => ({
    status: 'success',
    data: getSchemaLabels(type, [
      { name: 'jobRefer', schemas: [jobReferSchema] },
      { name: 'jobCategory', schemas: [jobCategorySchema] },
      { name: 'flowCategory', schemas: [flowCategorySchema] },
      { name: 'flow', schemas: [flowSchema] }
    ])
  })
};
