import { sendCardsMessage, sendCoreMessage } from './messageBroker';

export default {
  callback: async ({ subdomain, data }) => {
    console.log(data, 'data');

    //if contract found create transaction
    if (data.contentType !== 'cards:deals') {
      return;
    }

    const deal = await sendCardsMessage({
      subdomain,
      action: 'deals.findOne',
      data: {
        _id: data.contentTypeId
      },
      isRPC: true,
      defaultValue: null
    });
    if (!deal) return;

    const assignedUser =
      (deal.assignedUserIds &&
        deal.assignedUserIds.length > 0 &&
        (await sendCoreMessage({
          subdomain,
          action: 'users.findOne',
          data: {
            _id: deal.assignedUserIds[0]
          },
          isRPC: true,
          defaultValue: null
        }))) ||
      null;

    const advancePaidStage = await sendCardsMessage({
      subdomain,
      action: 'stages.findOne',
      data: { code: 'dealsAdvancePaid', type: 'deal' },
      isRPC: true,
      defaultValue: null
    });

    const dispatchPaymentReceivedStage = await sendCardsMessage({
      subdomain,
      action: 'stages.findOne',
      data: { code: 'dispatchPaymentReceived', type: 'deal' },
      isRPC: true,
      defaultValue: null
    });

    console.log(deal, 'deal');
    console.log(assignedUser, 'assignedUser');
    console.log(advancePaidStage, 'advancePaidStage');
    console.log('dispatchPaymentReceivedStage', dispatchPaymentReceivedStage);

    if (data.description.includes('урьдчилгаа')) {
      await sendCardsMessage({
        subdomain,
        action: 'editItem',
        data: {
          itemId: deal._id,
          type: 'deals',
          stageId: advancePaidStage._id,
          processId: Math.random(),
          user: assignedUser
        }
      });
    } else if (data.description.includes('үлдэгдэл')) {
      await sendCardsMessage({
        subdomain,
        action: 'editItem',
        data: {
          itemId: deal._id,
          type: 'deals',
          stageId: dispatchPaymentReceivedStage._id,
          processId: Math.random(),
          user: assignedUser
        }
      });
    }
    return;
  }
};
