import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
} from '@erxes/api-utils/src/logUtils';

export const putDeleteLog = async (subdomain: string, logDoc, user) => {
  await commonPutDeleteLog(
    subdomain,
    { ...logDoc, type: `webhooks:${logDoc.type}` },
    user,
  );
};

export const putUpdateLog = async (subdomain: string, logDoc, user) => {
  await commonPutUpdateLog(
    subdomain,
    { ...logDoc, type: `webhooks:${logDoc.type}` },
    user,
  );
};

export const putCreateLog = async (subdomain: string, logDoc, user) => {
  await commonPutCreateLog(
    subdomain,
    { ...logDoc, type: `webhooks:${logDoc.type}` },
    user,
  );
};
