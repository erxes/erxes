import { init as initBrokerCore } from '@erxes/api-utils/src/messageBroker';

import { graphqlPubsub } from './pubsub';
import { registerOnboardHistory } from './data/modules/robot';
import {
  Conformities,
  Configs,
  Users,
  Brands,
  EmailDeliveries
} from './db/models';
import { registerModule } from './data/permissions/utils';
import { sendEmail, sendMobileNotification } from './data/utils';
import { IUserDocument } from './db/models/definitions/users';

let client;

export const initBroker = async (options) => {
  client = await initBrokerCore(options);

  // do not receive messages in crons worker
  if (!['crons', 'workers'].includes(process.env.PROCESS_NAME || '')) {
    const { consumeQueue, consumeRPCQueue } = client;

    consumeQueue('registerPermissions', async permissions => {
      await registerModule(permissions);
    });

    consumeQueue('core:sendMobileNotification', async ({ data }) => {
      await sendMobileNotification(data);
    });

    consumeQueue('core:sendEmail', async ({ data }) => {
      await sendEmail(data);
    });

    consumeRPCQueue('core:conformities.addConformity', async ({ data }) => ({
      status: 'success',
      data: await Conformities.addConformity(data)
    }));

    consumeRPCQueue('core:conformities.savedConformity', async ({ data }) => ({
      status: 'success',
      data: await Conformities.savedConformity(data)
    }));

    consumeQueue('core:conformities.create', async ({ data }) => ({
      status: 'success',
      data: await Conformities.create(data)
    }));

    consumeQueue('core:conformities.removeConformities', async ({ data }) => ({
      status: 'success',
      data: await Conformities.removeConformities(data)
    }));

    consumeQueue('core:conformities.removeConformity', async ({ data }) => ({
      status: 'success',
      data: await Conformities.removeConformity(data)
    }));

    consumeRPCQueue('core:conformities.getConformities', async ({ data }) => ({
      status: 'success',
      data: await Conformities.getConformities(data)
    }));

    consumeQueue('core:conformities.addConformities', async ({ data }) => ({
      status: 'success',
      data: await Conformities.addConformities(data)
    }));

    consumeQueue('core:conformities.relatedConformity', async ({ data }) => ({
      status: 'success',
      data: await Conformities.relatedConformity(data)
    }));

    consumeRPCQueue('core:generateInternalNoteNotif', async ({ data }) => {
      if(data.type === 'user') {
        const { contentTypeId, notifDoc } = data;

        const usr = await Users.getUser(contentTypeId);

        notifDoc.content = `${usr.username || usr.email}`;

        return {
          status: 'success',
          data: notifDoc
        }
      }

      return {
        status: 'success',
        data: {}
      }
    });

    // graphql subscriptions call =========
    consumeQueue('callPublish', params => {
      graphqlPubsub.publish(params.name, params.data);
    });

    // listen for rpc queue =========
    consumeQueue('core:registerOnboardHistory', async ({ data: { type, user } }) => {
      await registerOnboardHistory(type, user);
    });

    consumeRPCQueue('core:configs.find', async args => ({
      status: 'success',
      data: await Configs.find(args).distinct('value')
    }));

    consumeRPCQueue('core:users.findOne', async query => ({
      status: 'success',
      data: await Users.findOne(query)
    }));

    consumeRPCQueue('core:users.find', async (data) => {
      const { query } = data;

      return {
        status: 'success',
        data: await Users.find(query).lean()
      }
    });

    consumeRPCQueue('core:brands.findOne', async query => ({
      status: 'success', data: await Brands.findOne(query)
    }));

    consumeRPCQueue('core:brands.find', async data => {
      const { query } = data;

      return {
        status: 'success', data: await Brands.find(query).lean()
      }
    });

    consumeRPCQueue('core:getActivityContent', async data => {
      const { action, content } = data;

      if (action === 'assignee') {
        let addedUsers: IUserDocument[] = [];
        let removedUsers: IUserDocument[] = [];

        if (content) {
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
      'core:activityLog:createdByDetail',
      async ({ activityLog }) => {
        const user = await Users.findOne({
          _id: activityLog && activityLog.createdBy
        });

        if (user) {
          return { data: { type: 'user', content: user }, status: 'success' };
        }

        return { data: {}, status: 'success' };
      }
    );

    consumeRPCQueue(
      'core:logs:collectItems',
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
  }

  return client;
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export const fetchSegment = (segmentId, options?) =>
  sendRPCMessage('segments:rpc_queue:fetchSegment', {
    segmentId,
    options
  });

export default function() {
  return client;
}