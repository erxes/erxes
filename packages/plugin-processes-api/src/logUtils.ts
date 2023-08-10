import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  LogDesc,
  IDescriptions,
  getSchemaLabels
} from '@erxes/api-utils/src/logUtils';

import { IModels } from './connectionResolver';
import messageBroker from './messageBroker';
import { jobReferSchema } from './models/definitions/jobs';
import { jobCategorySchema } from './models/definitions/jobCategories';
import { flowSchema } from './models/definitions/flows';
import { performSchema } from './models/definitions/performs';

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

export const MODULE_NAMES = {
  JOBREFER: 'jobRefer',
  JOBREFER_CATEGORY: 'jobReferCategory',
  FLOW: 'flow',
  WORK: 'work',
  OVERALWORK: 'overalWork',
  PERFORM: 'perform'
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
    { ...logDoc, description, extraDesc, type: `processes:${logDoc.type}` },
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
    { ...logDoc, description, extraDesc, type: `processes:${logDoc.type}` },
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
    { ...logDoc, description, extraDesc, type: `processes:${logDoc.type}` },
    user
  );
};

export default {
  getSchemaLabels: ({ data: { type } }) => ({
    status: 'success',
    data: getSchemaLabels(type, [
      { name: 'jobRefer', schemas: [jobReferSchema] },
      { name: 'jobCategory', schemas: [jobCategorySchema] },
      { name: 'flow', schemas: [flowSchema] },
      { name: 'perform', schemas: [performSchema] }
    ])
  })
};
