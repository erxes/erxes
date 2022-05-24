import { getSchemaLabels } from '@erxes/api-utils/src/logUtils';

import { MODULE_NAMES } from './data/constants';
import {
  brandEmailConfigSchema,
  brandSchema
} from './db/models/definitions/brands';
import {
  permissionSchema,
  userGroupSchema
} from './db/models/definitions/permissions';
import { IUserDocument, userSchema } from './db/models/definitions/users';
import { generateModels } from './connectionResolver';
// import { sendLogsMessage } from './messageBroker';

const LOG_MAPPINGS = [
  {
    name: MODULE_NAMES.BRAND,
    schemas: [brandEmailConfigSchema, brandSchema]
  },
  {
    name: MODULE_NAMES.PERMISSION,
    schemas: [permissionSchema]
  },
  {
    name: MODULE_NAMES.USER_GROUP,
    schemas: [userGroupSchema]
  },
  {
    name: MODULE_NAMES.USER,
    schemas: [userSchema]
  }
];

export default {
  collectItems: async ({}) => {
    return {
      status: 'success',
      data: {}
    };
  },
  getSchemaLabels: ({ data: { type } }) => ({
    status: 'success',
    data: getSchemaLabels(type, LOG_MAPPINGS)
  })
};
