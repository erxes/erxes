import { returnBill } from './../../../plugin-ebarimt-api/src/models/utils';
import { contentType } from './../../../plugin-forum-api/src/db/models/subscription/subscriptionOrder';
import {
  sendCardsMessage,
  sendClientPortalMessage,
  sendContactsMessage,
  sendFormsMessage
} from '../messageBroker';
import {
  notifyDealRelatedUsers,
  notifyConfirmationFilesAttached,
  notifyUnloadConfirmationFilesAttached
} from './utils';

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
  const deal = params.updatedDocument;
  const oldDeal = params.object;

  const stage = await sendCardsMessage({
    subdomain,
    action: 'stages.findOne',
    data: {
      _id: deal.stageId
    },
    isRPC: true,
    defaultValue: {}
  });

  if (deal.stageId !== oldDeal.stageId) {
    if (stage.code && stage.code === 'negotiationAccepted') {
      await notifyDealRelatedUsers(
        subdomain,
        process.env.WEB_CP_ID || '',
        deal,
        {
          title: 'Жолооч ажлын хүсэлт зөвшөөрсөн байна',
          content: `Жолоочоос ${deal.name} ажлыг зөвшөөрлөө. Та цааш үргэлжлүүлэхийн тулд төлбөр төлнө үү!`,
          link: `/shipping/payment?deal=${deal._id}`
        }
      );
    }

    if (stage.code && stage.code === 'advancePaid') {
      await notifyDealRelatedUsers(
        subdomain,
        process.env.MOBILE_CP_ID || '',
        deal,
        {
          title: 'Урьдчилгаа төлөгдсөн байна',
          content: `Таны ${deal.name} ажлын урьдчилгаа төлбөр төлөгдлөө!`,
          isMobile: true
        }
      );
    }

    if (stage.code && stage.code === 'start') {
      await notifyDealRelatedUsers(
        subdomain,
        process.env.WEB_CP_ID || '',
        deal,
        {
          title: 'Жолооч ажлыг хүлээн авлаа',
          content: `Жолооч ${deal.name} ажлыг хүлээн авлаа!`,
          link: `/monitoring/deal?id=${deal._id}`
        }
      );
    }

    if (stage.code && stage.code === 'ready') {
      await notifyDealRelatedUsers(
        subdomain,
        process.env.WEB_CP_ID || '',
        deal,
        {
          title: 'Бэлэн байдал хангагдлаа',
          content: `Жолооч ${deal.name} ажлыг бэлэн байдлыг хангалаа. Та ажлыг эхлүүлэх зөвшөөрөл олгоно уу!`,
          link: `/monitoring/deal?id=${deal._id}`
        }
      );
    }

    if (stage.code && stage.code === 'loadAccepted') {
      await notifyDealRelatedUsers(
        subdomain,
        process.env.MOBILE_CP_ID || '',
        deal,
        {
          title: 'Ачилт баталгаажлаа',
          content: `Таны ${deal.name} ажлын ачилт баталгаажлаа!`,
          isMobile: true
        }
      );
    }

    if (stage.code && stage.code === 'gone') {
      await notifyDealRelatedUsers(
        subdomain,
        process.env.WEB_CP_ID || '',
        deal,
        {
          title: 'Ачаа замд гарлаа',
          content: `Таны ${deal.name} ажил эхлэж жолооч замдаа гарлаа`,
          link: `/monitoring/deal?id=${deal._id}`
        }
      );
    }

    if (stage.code && stage.code === 'break') {
      await notifyDealRelatedUsers(
        subdomain,
        process.env.WEB_CP_ID || '',
        deal,
        {
          title: 'Саатал!!!',
          content: `Таны ${deal.name} - д саатал гарлаа!`,
          link: `/monitoring/deal?id=${deal._id}`
        }
      );
    }

    if (stage.code && stage.code === 'discoveredBreak') {
      await notifyDealRelatedUsers(
        subdomain,
        process.env.WEB_CP_ID || '',
        deal,
        {
          title: 'Саатал шийдвэрлэгдлээ',
          content: `Таны ${deal.name} - н саатал шийдвэрлэгдлээ!`,
          link: `/monitoring/deal?id=${deal._id}`
        }
      );
    }

    if (stage.code && stage.code === 'end') {
      await notifyDealRelatedUsers(
        subdomain,
        process.env.WEB_CP_ID || '',
        deal,
        {
          title: 'Ажил дууслаа',
          content: `Таны ${deal.name} - н ажил дууслаа!`,
          link: `/monitoring/deal?id=${deal._id}`
        }
      );
    }

    if (stage.code && stage.code === 'unloadAccepted') {
      await notifyDealRelatedUsers(
        subdomain,
        process.env.MOBILE_CP_ID || '',
        deal,
        {
          title: 'Буулгалт баталгаажлаа',
          content: `Таны ${deal.name} ажлын буулгалт баталгаажлаа!`,
          isMobile: true
        }
      );
    }

    // if (stage.code && stage.code === 'getPaid') {
    //   await notifyDealRelatedUsers(
    //     subdomain,
    //     process.env.MOBILE_CP_ID || '',
    //     deal,
    //     {
    //       title: 'Төлбөр төлөгдсөн байна',
    //       content: `Таны ${deal.name} ажлын төлбөр төлөгдлөө!`,
    //       isMobile: true
    //     }
    //   );
    // }

    return;
  }

  const staticField = await sendFormsMessage({
    subdomain,
    action: 'fields.findOne',
    data: {
      query: { contentType: 'cards:deal', code: 'staticCode' }
    },
    isRPC: true,
    defaultValue: null
  });

  if (staticField) {
    const updatedVal =
      deal.customFieldsData.find(f => f.field === staticField._id).value || '';
    const oldVal =
      oldDeal.customFieldsData.find(f => f.field === staticField._id).value ||
      '';

    if (updatedVal !== oldVal && updatedVal === 'ok') {
      await notifyDealRelatedUsers(
        subdomain,
        process.env.MOBILE_CP_ID || '',
        deal,
        {
          title: 'Зөвшөөрөл олгогдлоо',
          content: `Таны ${deal.name} ажилд захиалагчаас зөвшөөрөл олголоо!`,
          isMobile: true
        }
      );
      return;
    }
  }

  await notifyConfirmationFilesAttached(subdomain, deal, oldDeal);

  await notifyUnloadConfirmationFilesAttached(subdomain, deal, oldDeal);

  return;
};
