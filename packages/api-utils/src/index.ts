import { EMAIL_DELIVERY_STATUS } from './constants';
import {
  checkUserIds,
  chunkArray,
  fixDate,
  frontendEnv,
  getConfig,
  getConfigs,
  getDate,
  getEnv,
  getNextMonth,
  getToday,
  getUserDetail,
  paginate,
  regexSearchText,
  resetConfigsCache,
  validSearchText
} from './core';
import { createTransporter, readFile, sendEmail } from './emails';
import { putCreateLog, putDeleteLog, putUpdateLog } from './logUtils';
import {
  sendMobileNotification,
  sendNotification,
  sendRequest,
  sendToWebhook
} from './requests';
import { updateUserScore, getScoringConfig } from './scoring';
import {
  can,
  IActionMap,
  IPermissionContext,
  checkLogin,
  getKey,
  permissionWrapper,
  getUserActionsMap,
  checkPermission,
  requireLogin
} from './permissions';

import { ICustomerDocument } from './definitions/customers';
import { IUserDocument } from './definitions/users';
import { IContext } from './types';

export { EMAIL_DELIVERY_STATUS };
export { getEnv }; // ({ name, defaultValue })
export { getConfigs }; // (models, memoryStorage)
export { getConfig }; // (models, memoryStorage, code, defaultValue?)
export { resetConfigsCache }; // (memoryStorage)
export { frontendEnv }; // ({ name, req, requestInfo, })
export { getUserDetail }; // (user: IUserDocument)
export { paginate }; // ( collection, params: { ids ?: string[]; page ?: number; perPage ?: number } )
export { validSearchText }; // (values: string[])
export { regexSearchText }; // ( searchValue: string, searchKey = "searchText" )
export { readFile }; // (filename: string)
export { sendEmail }; // (models, memoryStorage, params: IEmailParams)
export { createTransporter }; // (models, memoryStorage, { ses })
export { sendRequest }; // ( { url, method, headers, form, body, params }: IRequestParams, errorMessage ?: string )
export { sendNotification }; // (models: any, memoryStorage, graphqlPubsub, doc: ISendNotification)
export { sendMobileNotification }; // ( models, { receivers, title, body, customerId, conversationId, })
export { fixDate };
export { getDate };
export { getToday };
export { getNextMonth };
export { checkUserIds };
export { chunkArray };
export { putCreateLog, putUpdateLog, putDeleteLog };
export { sendToWebhook };
export { updateUserScore };
export { getScoringConfig };
export {
  can,
  IActionMap,
  IPermissionContext,
  checkLogin,
  getKey,
  permissionWrapper,
  getUserActionsMap,
  checkPermission,
  requireLogin,
  // types
  ICustomerDocument,
  IUserDocument,
  IContext
};

export default {
  EMAIL_DELIVERY_STATUS,
  getEnv,
  getConfigs,
  getConfig,
  resetConfigsCache,
  frontendEnv,
  getUserDetail,
  paginate,
  validSearchText,
  regexSearchText,
  readFile,
  sendEmail,
  createTransporter,
  sendRequest,
  sendNotification,
  sendMobileNotification,
  sendToWebhook,
  fixDate,
  getDate,
  getToday,
  getNextMonth,
  checkUserIds,
  chunkArray,
  putCreateLog,
  putUpdateLog,
  putDeleteLog,
  updateUserScore,
  getScoringConfig
};
