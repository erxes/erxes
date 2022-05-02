import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  putActivityLog as commonPutActivityLog,
  LogDesc,
  IDescriptions,
  getSchemaLabels
} from '@erxes/api-utils/src/logUtils';
import { IModels, generateModels } from './connectionResolver';

import messageBroker from './messageBroker';

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};