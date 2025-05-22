import { ILogDataParams } from '@erxes/api-utils/src/logUtils';

import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog
} from '@erxes/api-utils/src/logUtils';

import { putActivityLog as commonPutActivityLog } from '@erxes/api-utils/src/logUtils';

import { generateModels } from './connectionResolver';

export const putDeleteLog = async (
  subdomain: string,
  logDoc: ILogDataParams,
  user
) => {
  await commonPutDeleteLog(
    subdomain,
    { ...logDoc, type: `tour:${logDoc.type}` },
    user
  );
};

export const putUpdateLog = async (
  subdomain: string,
  logDoc: ILogDataParams,
  user
) => {
  await commonPutUpdateLog(
    subdomain,
    { ...logDoc, type: `tour:${logDoc.type}` },
    user
  );
};

export const putCreateLog = async (
  subdomain: string,
  logDoc: ILogDataParams,
  user
) => {
  await commonPutCreateLog(
    subdomain,
    { ...logDoc, type: `tour:${logDoc.type}` },
    user
  );
};

export const putActivityLog = async (
  subdomain,
  params: { action: string; data: any }
) => {
  const { data, action } = params;

  const updatedParams = {
    ...params,
    data: { ...data, contentType: `${data.contentType}` }
  };

  return commonPutActivityLog(subdomain, {
    ...updatedParams
  });
};
