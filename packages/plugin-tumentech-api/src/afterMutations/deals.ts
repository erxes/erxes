import { sendCoreMessage } from './../messageBroker';
import { models } from '../connectionResolver';
import {
  sendCardsMessage,
  sendClientPortalMessage,
  sendContactsMessage,
} from '../messageBroker';

export const afterDealCreate = async (subdomain, params) => {
  const deal = params.object;

  const stage = await sendCardsMessage({
    subdomain,
    action: 'stages.findOne',
    data: {
      _id: deal.stageId,
    },
    isRPC: true,
    defaultValue: {},
  });

  if (stage.code && stage.code === 'newOrder') {
    const drivers = await sendContactsMessage({
      subdomain,
      action: 'customers.find',
      data: {
        tagIds: 'FwJtL7Tw7FWQT4nJW',
      },
      isRPC: true,
      defaultValue: {},
    });

    const driverIds = drivers.map((driver) => driver._id);

    const cpUsers = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortalUsers.find',
      data: {
        erxesCustomerId: { $in: driverIds },
        clientPortalId: process.env.MOBILE_CP_ID || '',
      },
      isRPC: true,
      defaultValue: [],
    });

    sendClientPortalMessage({
      subdomain,
      action: 'sendNotification',
      data: {
        title: 'Шинэ зар орлоо',
        content: 'Шинэ ажлын зар орсон байна!',
        receivers: cpUsers.map((u) => u._id),
        notifType: 'system',
        link: ``,
        isMobile: true,
      },
    });
  }

  return;
};

export const afterDealUpdate = async (subdomain, params) => {
  const deal = params.updatedDocument;

  const stage = await sendCardsMessage({
    subdomain,
    action: 'stages.findOne',
    data: {
      _id: deal.stageId,
    },
    isRPC: true,
    defaultValue: {},
  });

  if (stage.code && stage.code === 'negotiationAccepted') {
    const conformities = await sendCoreMessage({
        subdomain,
        action: 'conformities.getConformities',
        data: {
          mainType: 'deal',
          mainTypeIds: [deal._id],
          relTypes: ['customer']
        },
        isRPC: true,
        defaultValue: []
      });

    if (conformities.length === 0) {
      return;
    }

    for (const c of conformities) {
      const customer = await sendContactsMessage({
        subdomain,
        action: 'customers.findOne',
        data: {
          _id: c.relTypeId,
        },
        isRPC: true,
        defaultValue: null,
      });

      if (!customer) {
        continue;
      }

      const cpUser = await sendClientPortalMessage({
        subdomain,
        action: 'clientPortalUsers.findOne',
        data: {
          erxesCustomerId: customer._id,
          clientPortalId: process.env.WEB_CP_ID || '',
        },
        isRPC: true,
        defaultValue: null,
      });

      if (!cpUser) {
        continue;
      }

      sendClientPortalMessage({
        subdomain,
        action: 'sendNotification',
        data: {
          title: 'Жолооч ажлын хүсэлт зөвшөөрсөн байна',
          content: `Жолоочоос ${deal.name} ажлыг зөвшөөрлөө. Та цааш үргэлжлүүлэхийн тулд төлбөр төлнө үү!`,
          receivers: [cpUser._id],
          notifType: 'system',
          link: `/shipping/payment?deal=${deal._id}`,
          isMobile: false,
        },
      });
    }

    return;
  }
};
