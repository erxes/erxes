import {
  checkUserIds,
  chunkArray,
  fixDate,
  getDate,
  getEnv,
  getNextMonth,
  getToday,
  getUserDetail,
  paginate,
  regexSearchText,
  validSearchText,
  cleanHtml,
  splitStr,
  escapeRegExp
} from './core';
import { putCreateLog, putDeleteLog, putUpdateLog } from './logUtils';
import { sendRequest, sendToWebhook } from './requests';
import { updateUserScore, getScoringConfig } from './scoring';
import { generateFieldsFromSchema } from './fieldUtils';

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

import { IContext } from './types';
import { ruleSchema } from './definitions/common';
import { field, schemaWrapper } from './definitions/utils';

import { createXlsFile, generateXlsx } from './exporter';
import { IColumnLabel } from './types';

export { getEnv }; // ({ name, defaultValue })
export { getUserDetail }; // (user: IUserDocument)
export { paginate }; // ( collection, params: { ids ?: string[]; page ?: number; perPage ?: number } )
export { validSearchText }; // (values: string[])
export { regexSearchText }; // ( searchValue: string, searchKey = "searchText" )
export { sendRequest }; // ( { url, method, headers, form, body, params }: IRequestParams, errorMessage ?: string )
export { sendToWebhook };
export { fixDate };
export { getDate };
export { getToday };
export { getNextMonth };
export { checkUserIds };
export { chunkArray };
export { putCreateLog, putUpdateLog, putDeleteLog };
export { updateUserScore };
export { getScoringConfig };
export { generateFieldsFromSchema };
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
  IContext,
  IColumnLabel,
  ruleSchema,
  field,
  schemaWrapper
};

export default {
  cleanHtml,
  splitStr,
  escapeRegExp,
  getEnv,
  getUserDetail,
  paginate,
  validSearchText,
  regexSearchText,
  sendRequest,
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
  getScoringConfig,
  generateFieldsFromSchema,
  createXlsFile,
  generateXlsx
};
