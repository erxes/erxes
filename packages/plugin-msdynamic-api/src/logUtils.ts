import {
  IDescriptions,
  putCreateLog as commonPutCreateLog,
  putDeleteLog as commonPutDeleteLog,
  putUpdateLog as commonPutUpdateLog,
} from '@erxes/api-utils/src/logUtils';

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

const gatherDescriptions = async (params: any): Promise<IDescriptions> => {
  const { action, newData, updatedDocument } = params;

  const description = `"${newData.Description || updatedDocument.name}" has been ${action}d`;

  return { description, extraDesc: [] };
};

export const putCreateLog = async (subdomain: string, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions({
    ...logDoc,
    action: LOG_ACTIONS.CREATE,
  });

  await commonPutCreateLog(
    subdomain,
    { ...logDoc, description, extraDesc, type: `core:${logDoc.type}` },
    user
  );
};

export const putUpdateLog = async (subdomain: string, logDoc, user?) => {
  const { description, extraDesc } = await gatherDescriptions({
    ...logDoc,
    action: LOG_ACTIONS.UPDATE,
  });

  await commonPutUpdateLog(
    subdomain,
    { ...logDoc, description, extraDesc, type: `core:${logDoc.type}` },
    user
  );
};

export const putDeleteLog = async (subdomain: string, logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions({
    ...logDoc,
    action: LOG_ACTIONS.DELETE,
  });

  await commonPutDeleteLog(
    subdomain,
    { ...logDoc, description, extraDesc, type: `core:${logDoc.type}` },
    user
  );
};

export default {};
