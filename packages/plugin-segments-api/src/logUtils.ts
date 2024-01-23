import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  putActivityLog as commonPutActivityLog,
} from '@erxes/api-utils/src/logUtils';

export const putDeleteLog = async (subdomain: string, logDoc, user) => {
  await commonPutDeleteLog(
    subdomain,
    { ...logDoc, type: `segments:${logDoc.type}` },
    user,
  );
};

export const putUpdateLog = async (subdomain: string, logDoc, user) => {
  await commonPutUpdateLog(
    subdomain,
    { ...logDoc, type: `segments:${logDoc.type}` },
    user,
  );
};

export const putCreateLog = async (subdomain: string, logDoc, user) => {
  await commonPutCreateLog(
    subdomain,
    { ...logDoc, type: `segments:${logDoc.type}` },
    user,
  );
};

export const putActivityLog = async (
  subdomain: string,
  params: { action: string; data: any },
) => {
  const { data } = params;

  const updatedParams = {
    ...params,
    subdomain,
    data: { ...data, contentType: data.contentType },
  };

  return commonPutActivityLog(subdomain, {
    ...updatedParams,
  });
};
