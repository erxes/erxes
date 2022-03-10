import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
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