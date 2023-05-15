import moment = require('moment');
import { models } from '../connectionResolver';
import {
  sendCardsMessage,
  sendClientPortalMessage,
  sendContactsMessage,
  sendCoreMessage,
  sendFormsMessage
} from '../messageBroker';
import {
  notifyDealRelatedUsers,
  notifyConfirmationFilesAttached,
  notifyUnloadConfirmationFilesAttached
} from './utils';

export const afterDealCreate = async (subdomain, params) => {
  const deal = params.object;

  if (deal.description.includes('test')) {
    return;
  }

  const stage = await sendCardsMessage({
    subdomain,
    action: 'stages.findOne',
    data: {
      _id: deal.stageId
    },
    isRPC: true,
    defaultValue: {}
  });

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

  const testers = await sendContactsMessage({
    subdomain,
    action: 'customers.find',
    data: {
      description: 'tester'
    },
    isRPC: true,
    defaultValue: []
  });

  const testerIds = testers.map(tester => tester._id);

  const customerIds = conformities.map(c => c.relTypeId);

  if (testerIds.some(testerId => customerIds.includes(testerId))) {
    return;
  }

  if ((stage.code && stage.code === 'newOrder') || stage.code === 'dealsNew') {
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

    const notifData: any = {
      title: 'Шинэ зар орлоо',
      content: `Шинэ ажлын зар орсон байна!`,
      receivers: cpUsers.map(cpUser => cpUser._id),
      notifType: 'system',
      link: '',
      isMobile: true,
      eventData: {
        type: 'deal',
        id: deal._id
      }
    };

    sendClientPortalMessage({
      subdomain,
      action: 'sendNotification',
      data: notifData
    });
  }

  return;
};

export const afterDealUpdate = async (subdomain, params) => {
  const deal = params.updatedDocument;
  const oldDeal = params.object;

  if (oldDeal.description.includes('test')) {
    return;
  }

  const stage = await sendCardsMessage({
    subdomain,
    action: 'stages.findOne',
    data: {
      _id: deal.stageId
    },
    isRPC: true,
    defaultValue: {}
  });

  await notifyConfirmationFilesAttached(subdomain, deal, oldDeal);

  await notifyUnloadConfirmationFilesAttached(subdomain, deal, oldDeal);

  if (deal.stageId !== oldDeal.stageId) {
    if (
      (stage.code && stage.code === 'negotiationAccepted') ||
      stage.code === 'dealsNegotiated'
    ) {
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

    if (stage.code && stage.code === 'dealsAdvancePaid') {
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

    if (
      (stage.code && stage.code === 'start') ||
      stage.code === 'dispatchStarted'
    ) {
      const trip = await models.Trips.findOne({ dealId: deal._id });
      const dealRoute = await models.DealRoutes.findOne({ dealId: deal._id });
      const participant = await models.Participants.findOne({
        dealId: deal._id,
        status: 'won'
      });

      let estimatedCloseDate: any;

      if (!trip && participant) {
        if (dealRoute) {
          const route = (await models.Routes.findOne({
            _id: dealRoute.routeId
          })) || { directionIds: [] };

          const result: any = await models.Directions.aggregate([
            { $match: { _id: { $in: route.directionIds } } },
            {
              $group: {
                _id: null,
                duration: {
                  $sum: '$duration'
                }
              }
            },
            {
              $project: {
                duration: '$duration'
              }
            }
          ]);

          if (!result || !result.length) {
            return null;
          }

          const obj: any = result[0];
          estimatedCloseDate = moment(new Date())
            .add(obj.duration, 'minutes')
            .toDate();
        }

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

        await models.Trips.create({
          dealIds: [deal._id],
          driverId: participant.driverId,
          carIds: participant.carIds,
          routeId: dealRoute && dealRoute.routeId,
          status: 'open',
          routeReversed: dealRoute && dealRoute.reversed,
          startedDate: new Date(),
          customerIds: conformities.map(c => c.relTypeId),
          estimatedCloseDate
        });
      }

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

    if (
      (stage.code && stage.code === 'ready') ||
      stage.code === 'dispatchReady'
    ) {
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

    if (
      (stage.code && stage.code === 'loadAccepted') ||
      stage.code === 'dispatchLoadAccepted'
    ) {
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

    if (
      (stage.code && stage.code === 'gone') ||
      stage.code === 'dispatchOngoing'
    ) {
      await models.Trips.updateOne(
        { dealIds: deal._id },
        { $set: { status: 'ongoing' } }
      );

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

    if (
      (stage.code && stage.code === 'break') ||
      stage.code === 'dispatchDelayed'
    ) {
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

    if (
      (stage.code && stage.code === 'discoveredBreak') ||
      stage.code === 'dispatchSolved'
    ) {
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

    if (
      (stage.code && stage.code === 'end') ||
      stage.code === 'dispatchArrived'
    ) {
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

    if (
      (stage.code && stage.code === 'unloadAccepted') ||
      stage.code === 'dispatchUnloadConfirmed'
    ) {
      await models.Trips.updateOne(
        { dealIds: deal._id },
        { $set: { status: 'closed' } }
      );
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

    if (stage.code === 'dispatchContractPayment') {
      await notifyDealRelatedUsers(
        subdomain,
        process.env.MOBILE_CP_ID || '',
        deal,
        {
          title: 'Төлбөр хүлээгдэж байна',
          content: `${deal.name} ажлын төлбөр хүлээгдэж байна!`,
          isMobile: true
        }
      );
    }

    if (
      (stage.code && stage.code === 'complete') ||
      stage.code === 'dispatchSuccess'
    ) {
      await notifyDealRelatedUsers(
        subdomain,
        process.env.MOBILE_CP_ID || '',
        deal,
        {
          title: 'Төлбөр төлөгдсөн байна',
          content: `Таны ${deal.name} ажлын төлбөр төлөгдлөө!`,
          isMobile: true
        }
      );
    }

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
      deal.customFieldsData.find(
        f => f.field === staticField._id && f.value === 'ok'
      ).value || '';
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

  return;
};
