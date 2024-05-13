import {
  gatherNames,
  getSchemaLabels,
  IDescriptions,
  LogDesc,
  putCreateLog as commonPutCreateLog,
  putDeleteLog as commonPutDeleteLog,
  putUpdateLog as commonPutUpdateLog,
} from '@erxes/api-utils/src/logUtils';
import { IModels } from './connectionResolver';
import { ICallHistory } from './models/definitions/callHistories';

export const MODULE_NAMES = {
  ASSET: 'asset',
  ASSET_CATEGORIES: 'assetCategories',
  MOVEMENT: 'movement',
};

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

export const putCreateLog = async (
  models: IModels,
  subdomain: string,
  logDoc,
  user,
) => {
  await commonPutCreateLog(
    subdomain,
    {
      ...logDoc,
      description: 'created history',
      type: `calls:${logDoc.type}`,
    },
    user,
  );
};

export const putUpdateLog = async (
  models: IModels,
  subdomain: string,
  logDoc,
  user,
) => {
  await commonPutUpdateLog(
    subdomain,
    {
      ...logDoc,
      description: 'created history',
      type: `calls:${logDoc.type}`,
    },
    user,
  );
};

export const putDeleteLog = async (
  models: IModels,
  subdomain: string,
  logDoc,
  user,
) => {
  await commonPutDeleteLog(
    subdomain,
    { ...logDoc, description: '', type: `assets:${logDoc.type}` },
    user,
  );
};
