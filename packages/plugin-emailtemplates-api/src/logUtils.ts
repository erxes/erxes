import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  getSchemaLabels,
} from '@erxes/api-utils/src/logUtils';
import { emailTemplateSchema } from './models/definitions/emailTemplates';
import { sendMessage } from '@erxes/api-utils/src/core';

export const putDeleteLog = async (subdomain: string, logDoc, user) => {
  await commonPutDeleteLog(
    subdomain,
    { ...logDoc, type: `emailTemplates:${logDoc.type}` },
    user,
  );
};

export const putUpdateLog = async (subdomain: string, logDoc, user) => {
  await commonPutUpdateLog(
    subdomain,
    { ...logDoc, type: `emailTemplates:${logDoc.type}` },
    user,
  );
};

export const putCreateLog = async (subdomain: string, logDoc, user) => {
  await sendMessage({
    serviceName: 'core',
    subdomain,
    action: 'registerOnboardHistory',
    data: {
      type: 'emailTemplateCreate',
      user,
    },
  });

  await commonPutCreateLog(
    subdomain,
    { ...logDoc, type: `emailTemplates:${logDoc.type}` },
    user,
  );
};

export default {
  getSchemaLabels: ({ data: { type } }) => ({
    status: 'success',
    data: getSchemaLabels(type, [
      { name: 'emailTemplate', schemas: [emailTemplateSchema] },
    ]),
  }),
};
