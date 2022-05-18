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
import { sendLogsMessage } from './messageBroker';

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
  getActivityContent: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { action, content } = data;

    if (action === 'assignee') {
      let addedUsers: IUserDocument[] = [];
      let removedUsers: IUserDocument[] = [];

      if (content) {
        addedUsers = await models.Users.findUsers({
          _id: { $in: content.addedUserIds }
        });

        removedUsers = await models.Users.findUsers({
          _id: { $in: content.removedUserIds }
        });
      }

      return {
        data: { addedUsers, removedUsers },
        status: 'success'
      };
    }

    return {
      status: 'error',
      data: 'wrong activity action'
    };
  },
  collectItems: async ({ subdomain, data: { contentId } }) => {
    const deliveries = await sendLogsMessage({
      subdomain,
      action: 'emailDeliveries.find',
      data: {
        query: {
          customerId: contentId
        }
      },
      isRPC: true,
      defaultValue: []
    });

    const results: any[] = [];

    for (const d of deliveries) {
      results.push({
        _id: d._id,
        contentType: 'email',
        contentId,
        createdAt: d.createdAt
      });
    }

    return {
      status: 'success',
      data: results
    };
  },
  getSchemaLabels: ({ data: { type } }) => ({
    status: 'success',
    data: getSchemaLabels(type, LOG_MAPPINGS)
  })
};
