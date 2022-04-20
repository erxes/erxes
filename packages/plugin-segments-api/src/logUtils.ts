import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  putActivityLog as commonPutActivityLog
} from '@erxes/api-utils/src/logUtils';

import messageBroker from './messageBroker';

export const putDeleteLog = async (logDoc, user) => {
  await commonPutDeleteLog(
    messageBroker(),
    { ...logDoc, type: `segments:${logDoc.type}` },
    user
  );
};

export const putUpdateLog = async (logDoc, user) => {
  await commonPutUpdateLog(
    messageBroker(),
    { ...logDoc, type: `segments:${logDoc.type}` },
    user
  );
};

export const putCreateLog = async (logDoc, user) => {
  await commonPutCreateLog(
    messageBroker(),
    { ...logDoc, type: `segments:${logDoc.type}` },
    user
  );
};
export const putActivityLog = async (subdomain: string, params: { action: string; data: any }) => {
  const { data } = params;

  const updatedParams = { ...params, subdomain, data: { ...data, contentType: data.contentType } };

  return commonPutActivityLog(subdomain, { messageBroker: messageBroker(), ...updatedParams });
};