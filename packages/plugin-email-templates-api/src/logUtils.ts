import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  getSchemaLabels
} from '@erxes/api-utils/src/logUtils';
import { emailTemplateSchema } from './models/definitions/emailTemplates';
import messageBroker from './messageBroker';

export const putDeleteLog = async (logDoc, user) => {
  await commonPutDeleteLog(
    messageBroker(),
    { ...logDoc, type: `emailTemplates:${logDoc.type}` },
    user
  );
};

export const putUpdateLog = async (logDoc, user) => {
  await commonPutUpdateLog(
    messageBroker(),
    { ...logDoc, type: `emailTemplates:${logDoc.type}` },
    user
  );
};

export const putCreateLog = async (logDoc, user) => {
  await commonPutCreateLog(
    messageBroker(),
    { ...logDoc, type: `emailTemplates:${logDoc.type}` },
    user
  );
};

export default {
  getSchemaLabels: ({ data: { type } }) => ({
    status: 'success',
    data: getSchemaLabels(type, [{ name: 'emailTemplate', schemas: [emailTemplateSchema] }]),
  })
};
