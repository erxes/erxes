import * as _ from 'underscore';

import { RABBITMQ_QUEUES } from '../data/constants';

// import {
//   checkFile,
//   frontendEnv,
//   getConfig,
//   getSubServiceDomain,
//   registerOnboardHistory,
//   uploadFile
// } from '../data/utils';

import messageBroker, { getFileUploadConfigs } from '../messageBroker';

export const importer = async (
  contentTypes,
  files,
  columnsConfig,
  importHistoryId,
  associatedContentType,
  associatedField,
  user
) => {
  try {
    const { UPLOAD_SERVICE_TYPE } = await getFileUploadConfigs();

    await messageBroker().sendMessage(RABBITMQ_QUEUES.RPC_API_TO_WORKERS, {
      action: 'createImport',
      contentTypes,
      files,
      uploadType: UPLOAD_SERVICE_TYPE,
      columnsConfig,
      user,
      importHistoryId,
      associatedContentType,
      associatedField
    });
  } catch (e) {
    console.log(e);
    // throw new Error();
  }
};

export const uploader = async (_req: any, _res, _next) => {
  return 'aa';
};
