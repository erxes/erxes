import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
} from '@erxes/api-utils/src/logUtils';

import { gatherDescriptions } from './logHelper';
import messageBroker from './messageBroker';

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

export const putDeleteLog = async (models, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(models, {
    ...logDoc,
    action: LOG_ACTIONS.DELETE,
  });

  await commonPutDeleteLog(
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `knowledgebase:${logDoc.type}` },
    user
  );
};

export const putUpdateLog = async (models, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(models, {
    ...logDoc,
    action: LOG_ACTIONS.UPDATE,
  });

  await commonPutUpdateLog(
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `knowledgebase:${logDoc.type}` },
    user
  );
};

export const putCreateLog = async (models, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(models, {
    ...logDoc,
    action: LOG_ACTIONS.CREATE,
  });

  await commonPutCreateLog(
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `knowledgebase:${logDoc.type}` },
    user
  );
};
