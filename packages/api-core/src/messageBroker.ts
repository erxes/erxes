import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';

import { graphqlPubsub } from './pubsub';
import { registerOnboardHistory } from './data/modules/robot';
import {
  Conformities,
  Forms,
  FieldsGroups,
  Fields,
  Configs,
  Users,
  Brands,
  EmailDeliveries
} from './db/models';
import { fetchSegment } from './data/modules/segments/queryBuilder';
import { registerModule } from './data/permissions/utils';
import { sendEmail, sendMobileNotification } from './data/utils';
import { fieldsCombinedByContentType } from './data/modules/fields/utils';
import { IUserDocument } from './db/models/definitions/users';
import * as models from './db/models/index';

dotenv.config();

interface IMongoFindParams {
  query: any;
  name: string;
}

let client;

export const initBroker = async (server?) => {
  client = await messageBroker({
    name: 'api',
    server,
    envs: process.env
  });

  // do not receive messages in crons worker
  if (!['crons', 'workers'].includes(process.env.PROCESS_NAME || '')) {
    const { consumeQueue, consumeRPCQueue } = client;

    consumeQueue('registerPermissions', async permissions => {
      await registerModule(permissions);
    });

    consumeQueue('core:sendMobileNotification', async doc => {
      await sendMobileNotification(doc);
    });

    consumeQueue('core:sendEmail', async doc => {
      await sendEmail(doc);
    });

    consumeRPCQueue(
      'forms:rpc_queue:validate',
      async ({ formId, submissions }) => ({
        status: 'success',
        data: await Forms.validate(formId, submissions)
      })
    );

    consumeRPCQueue('forms:rpc_queue:duplicate', async ({ formId }) => ({
      status: 'success',
      data: await Forms.duplicate(formId)
    }));

    consumeQueue('forms:removeForm', async ({ formId }) => ({
      status: 'success',
      data: await Forms.removeForm(formId)
    }));

    consumeRPCQueue('conformities:addConformity', async doc => ({
      status: 'success',
      data: await Conformities.addConformity(doc)
    }));

    consumeRPCQueue('conformities:savedConformity', async doc => ({
      status: 'success',
      data: await Conformities.savedConformity(doc)
    }));

    consumeQueue('conformities:create', async doc => ({
      status: 'success',
      data: await Conformities.create(doc)
    }));

    consumeQueue('conformities:removeConformities', async doc => ({
      status: 'success',
      data: await Conformities.removeConformities(doc)
    }));

    consumeQueue('conformities:removeConformity', async doc => ({
      status: 'success',
      data: await Conformities.removeConformity(doc)
    }));

    consumeRPCQueue('conformities:getConformities', async doc => ({
      status: 'success',
      data: await Conformities.getConformities(doc)
    }));

    consumeQueue('conformities:addConformities', async doc => ({
      status: 'success',
      data: await Conformities.addConformities(doc)
    }));

    consumeQueue('conformities:relatedConformity', async doc => ({
      status: 'success',
      data: await Conformities.relatedConformity(doc)
    }));

    consumeRPCQueue(
      'fields:rpc_queue:prepareCustomFieldsData',
      async ({ doc }) => ({
        status: 'success',
        data: await Fields.prepareCustomFieldsData(doc)
      })
    );

    consumeRPCQueue(
      'fields:rpc_queue:generateCustomFieldsData',
      async ({ customData, contentType }) => ({
        status: 'success',
        data: await Fields.generateCustomFieldsData(customData, contentType)
      })
    );

    consumeRPCQueue('rpc_queue:fetchSegment', async ({ segment, options }) => {
      const data = await fetchSegment(segment, options);
      return { data, status: 'success' };
    });

    // graphql subscriptions call =========
    consumeQueue('callPublish', params => {
      graphqlPubsub.publish(params.name, params.data);
    });

    // listen for rpc queue =========
    consumeQueue('registerOnboardHistory', async ({ type, user }) => {
      await registerOnboardHistory(type, user);
    });

    consumeQueue(
      'fieldsGroups:updateGroup',
      async ({ groupId, fieldsGroup }) => ({
        status: 'success',
        data: await FieldsGroups.updateGroup(groupId, fieldsGroup)
      })
    );

    consumeRPCQueue('rpc_queue:Fields.find', async ({ query, projection, sort }) => {
      return {
        status: 'success',
        data: await Fields.find(query, projection).sort(sort).lean()
      };
    });

    consumeRPCQueue('rpc_queue:fieldsCombinedByContentType', async arg => {
      return {
        status: 'success',
        data: await fieldsCombinedByContentType(arg)
      };
    });

    consumeRPCQueue('configs:rpc_queue:getConfigs', async args => ({
      status: 'success',
      data: await Configs.find(args).distinct('value')
    }));

    consumeRPCQueue('core:rpc_queue:getActivityContent', async data => {
      const { action, content } = data;

      if (action === 'assignee') {
        let addedUsers: IUserDocument[] = [];
        let removedUsers: IUserDocument[] = [];

        if (content) {
          // addedUsers = await getDocumentList('users', {
          //   _id: { $in: content.addedUserIds },
          // });
          addedUsers = await Users.find({ _id: { $in: content.addedUserIds } });

          removedUsers = await Users.find({
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
    });

    consumeRPCQueue(
      'core:rpc_queue:activityLog:createdByDetail',
      async ({ activityLog }) => {
        const user = await Users.findOne({
          _id: activityLog && activityLog.createdBy
        });

        if (user) {
          return { data: { type: 'user', content: user }, status: 'success' };
        }

        const integration = await sendRPCMessage(
          'inbox:rpc_queue:getIntegration',
          { _id: activityLog.createdBy }
        );

        if (integration) {
          const brand = await Brands.findOne({ _id: integration.brandId });

          return { data: { type: 'brand', content: brand }, status: 'success' };
        }

        return { data: 'not found', status: 'error' };
      }
    );

    consumeRPCQueue(
      'core:rpc_queue:activityLog:collectItems',
      async ({ contentId }) => {
        const deliveries = await EmailDeliveries.find({
          customerId: contentId
        }).lean();
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
      }
    );

    consumeRPCQueue('core:rpc_queue:findOneUser', async query => ({
      status: 'success',
      data: await Users.findOne(query)
    }));

    consumeRPCQueue('core:rpc_queue:findMongoDocuments', async (data: IMongoFindParams) => {
      const { query, name } = data;

      const collection = models[name];

      return {
        status: 'success',
        data: collection ? await collection.find(query) : []
      }
    });

    consumeRPCQueue('core:rpc_queue:findOneBrand', async query => ({
      status: 'success', data: await Brands.findOne(query)
    }));

    consumeRPCQueue("core:Fields.generateTypedListFromMap", data => ({
      status: "success",
      data: Fields.generateTypedListFromMap(data),
    }));
  }

  return client;
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export default function() {
  return client;
}
