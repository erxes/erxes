import {
  sendCardsMessage,
  sendClientPortalMessage,
  sendContactsMessage
} from '../messageBroker';
import { notifyDealRelatedUsers } from './utils';

export const afterDealCreate = async (subdomain, params) => {
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
        content: `Шинэ ажлын зар орсон байна!`,
        receivers: cpUsers.map(cpUser => cpUser._id),
        notifType: 'system',
        link: '',
        isMobile: true
      }
    });
  }

  return;
};

export const afterDealUpdate = async (subdomain, params) => {
  // const oldDeal = params.object;
  const deal = params.updatedDocument;

  const stage = await sendCardsMessage({
    subdomain,
    action: 'stages.findOne',
    data: {
      _id: deal.stageId
    },
    isRPC: true,
    defaultValue: {}
  });

  if (stage.code && stage.code === 'negotiationAccepted') {
    await notifyDealRelatedUsers(subdomain, process.env.WEB_CP_ID || '', deal, {
      title: 'Жолооч ажлын хүсэлт зөвшөөрсөн байна',
      content: `Жолоочоос ${deal.name} ажлыг зөвшөөрлөө. Та цааш үргэлжлүүлэхийн тулд төлбөр төлнө үү!`,
      link: `/shipping/payment?deal=${deal._id}`
    });
  }

  if (stage.code && stage.code === 'advancePaid') {
    await notifyDealRelatedUsers(
      subdomain,
      process.env.MOBILE_CP_ID || '',
      deal,
      {
        title: 'Төлбөр урьдчилгаа төлөгдсөн байна',
        content: `Таны ${deal.name} ажлын урьдчилгаа төлбөр төлөгдсөн байна!`,
        isMobile: true
      }
    );
  }

  if (stage.code && stage.code === 'start') {
    await notifyDealRelatedUsers(
      subdomain,
      process.env.MOBILE_CP_ID || '',
      deal,
      {
        title: 'Жолооч ажлыг хүлээн авлаа',
        content: `Жолооч ${deal.name} ажлыг хүлээн авч, эхлүүлсэн байна!`,
        link: `/monitoring/deal?id=${deal._id}`
      }
    );
  }

  return;
};
