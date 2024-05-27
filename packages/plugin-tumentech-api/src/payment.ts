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

    const usr = await sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: { role: 'system' },
      isRPC: true
    });

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
    console.log('advancePaidStage', advancePaidStage._id);
    console.log(
      'dispatchPaymentReceivedStage',
      dispatchPaymentReceivedStage._id
    );
    console.log('usr', usr);

    if (data.description.includes('урьдчилгаа')) {
      await sendCardsMessage({
        subdomain,
        action: 'editItem',
        data: {
          itemId: deal._id,
          type: 'deal',
          stageId: advancePaidStage._id,
          processId: Math.random(),
          user: usr
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
          user: usr
        },

        isRPC: true
      });
    }
    return;
  }
};
