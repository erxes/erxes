import { generateModels } from './connectionResolver';
import { sendCommonMessage } from './messageBroker';

export default {
  callback: async ({ subdomain, data }) => {
    if (data.contentType !== 'cards:deal') {
      return;
    }

    const models = await generateModels(subdomain);

    const item = await models.Items.findOne({
      dealId: data.contentTypeId
    });

    if (!item) return;

    const deal = await sendCommonMessage({
      serviceName: 'cards',
      subdomain,
      action: 'deals.findOne',
      data: {
        _id: data.contentTypeId
      },
      isRPC: true,
      defaultValue: null
    });
    if (!deal) return;

    const paidStage = await sendCommonMessage({
      serviceName: 'cards',
      subdomain,
      action: 'stages.findOne',
      data: { code: 'Done', type: 'deal' },
      isRPC: true,
      defaultValue: null
    });

    if (!paidStage) return;

    await sendCommonMessage({
      serviceName: 'cards',
      subdomain,
      action: 'editItem',
      data: {
        itemId: deal._id,
        type: 'deal',
        stageId: paidStage._id,
        processId: Math.random(),
        userId: deal.userId || ''
      },

      isRPC: true
    });

    return;
  }
};
