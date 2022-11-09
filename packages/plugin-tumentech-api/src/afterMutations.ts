import {
  sendCardsMessage,
  sendClientPortalMessage,
  sendContactsMessage
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
            erxesCustomerId: { $in: driverIds },
            clientPortalId: process.env.MOBILE_CP_ID || ''
          },
          isRPC: true,
          defaultValue: []
        });

        sendClientPortalMessage({
          subdomain,
          action: 'sendNotification',
          data: {
            title: 'Шинэ зар орлоо',
            content: 'Шинэ ажлын зар орсон байна!',
            receivers: cpUsers.map(u => u._id),
            notifType: 'system',
            link: ``,
            isMobile: true
          }
        });
      }
    }
    return;
  }
};
