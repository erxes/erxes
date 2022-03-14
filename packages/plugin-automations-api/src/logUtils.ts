import { ILogDataParams } from '@erxes/api-utils/src/logUtils';

import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
} from '@erxes/api-utils/src/logUtils';

import messageBroker from './messageBroker';

export const putDeleteLog = async (logDoc: ILogDataParams, user) => {
  await commonPutDeleteLog(
    messageBroker(),
    { ...logDoc, type: `automations:${logDoc.type}` },
    user
  );
};

export const putUpdateLog = async (logDoc: ILogDataParams, user) => {
  await commonPutUpdateLog(
    messageBroker(),
    { ...logDoc, type: `automations:${logDoc.type}` },
    user
  );
};

export const putCreateLog = async (logDoc: ILogDataParams, user) => {
  await commonPutCreateLog(
    messageBroker(),
    { ...logDoc, type: `automations:${logDoc.type}` },
    user
  );
};