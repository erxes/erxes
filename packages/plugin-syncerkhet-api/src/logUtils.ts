import * as _ from 'underscore';
import {
  putCreateLog as commonPutCreateLog,
  putDeleteLog as commonPutDeleteLog,
  putUpdateLog as commonPutUpdateLog
} from '@erxes/api-utils/src/logUtils';

import { IModels } from './connectionResolver';
import { IUserDocument } from '@erxes/api-utils/src/types';
import messageBroker from './messageBroker';

export type LogDesc = {
  [key: string]: any;
} & { name: any };

/**
 * @param object - Previous state of the object
 * @param newData - Requested update data
 * @param updatedDocument - State after any updates to the object
 */
export interface ILogDataParams {
  type: string;
  description?: string;
  object: any;
  newData?: object;
  extraDesc?: object[];
  updatedDocument?: any;
}

/**
 * Prepares a create log request to log server
 * @param params Log document params
 * @param user User information from mutation context
 */
export const putCreateLog = async (
  models: IModels,
  subdomain: string,
  params: ILogDataParams,
  user: IUserDocument
) => {
  return commonPutCreateLog(
    subdomain,
    messageBroker(),
    {
      ...params,
      type: `syncerkhet:${params.type}`
    },
    user
  );
};

/**
 * Prepares a create log request to log server
 * @param params Log document params
 * @param user User information from mutation context
 */
export const putUpdateLog = async (
  models: IModels,
  subdomain: string,
  params: ILogDataParams,
  user: IUserDocument
) => {
  return commonPutUpdateLog(
    subdomain,
    messageBroker(),
    {
      ...params,
      type: `syncerkhet:${params.type}`
    },
    user
  );
};

/**
 * Prepares a create log request to log server
 * @param params Log document params
 * @param user User information from mutation context
 */
export const putDeleteLog = async (
  models: IModels,
  subdomain: string,
  params: ILogDataParams,
  user: IUserDocument
) => {
  return commonPutDeleteLog(
    subdomain,
    messageBroker(),
    { ...params, type: `syncerkhet:${params.type}` },
    user
  );
};
