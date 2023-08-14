import { sendCardsMessage, sendCoreMessage } from './messageBroker';

export default {
  callback: async ({ subdomain, data }) => {
    //if contract found create transaction
    if (data.contentType !== 'tumentech:deals') {
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

    console.log('deal', deal._id);
    console.log('assignedUser', assignedUser._id);
    console.log('advancePaidStage', advancePaidStage._id);
    console.log(
      'dispatchPaymentReceivedStage',
      dispatchPaymentReceivedStage._id
    );

    if (data.description.includes('урьдчилгаа')) {
      await sendCardsMessage({
        subdomain,
        action: 'editItem',
        data: {
          itemId: deal._id,
          type: 'deal',
          stageId: advancePaidStage._id,
          processId: Math.random(),
          user: assignedUser
        },
        isRPC: true
      });
    } else if (data.description.includes('үлдэгдэл')) {
      await sendCardsMessage({
        subdomain,
        action: 'editItem',
        data: {
          itemId: deal._id,
          type: 'deal',
          stageId: dispatchPaymentReceivedStage._id,
          processId: Math.random(),
          user: assignedUser
        },

        isRPC: true
      });
    }
    return;
  }
};
