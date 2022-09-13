import {
  sendCoreMessage,
  sendCardsMessage,
  sendContactsMessage,
  sendClientPortalMessage
} from './messageBroker';

export default {
  'cards:deal': ['create']
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action } = params;

  if (type === 'cards:deal') {
    if (action === 'create') {
      const deal = params.object;

      const stage = await sendCardsMessage({
        subdomain,
        action: 'stages.findOne',
        data: {
          _id: deal.stageId
        },
        isRPC: true,
        defaultValue: {}
      });

      if (stage.code && stage.code === 'newOrder') {
        const drivers = await sendContactsMessage({
          subdomain,
          action: 'customers.find',
          data: {
            tagIds: 'FwJtL7Tw7FWQT4nJW'
          },
          isRPC: true,
          defaultValue: {}
        });

        const driverIds = drivers.map(driver => driver._id);

        const cpUsers = await sendClientPortalMessage({
          subdomain,
          action: 'clientPortalUsers.find',
          data: {
            _id: { $in: driverIds },
            clientPortalId: process.env.MOBILE_CP_ID || ''
          },
          isRPC: true,
          defaultValue: []
        });

        const deviceTokens: string[] = [];

        deviceTokens.push(...cpUsers.map(user => user.deviceTokens));

        sendCoreMessage({
          subdomain: subdomain,
          action: 'sendMobileNotification',
          data: {
            title: 'Шинэ зар орлоо',
            body: 'Шинэ ажлын зар орсон байна!',
            deviceTokens
          }
        });
      }
    }
    return;
  }
};
