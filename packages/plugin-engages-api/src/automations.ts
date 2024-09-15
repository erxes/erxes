import { generateModels } from './connectionResolver';
import { send } from './engageUtils';
import * as moment from 'moment';

export default {
  constants: {
    actions: [
      {
        type: 'engages:campaign.create',
        icon: 'rss',
        label: 'Start campaign',
        description: 'Start campaign',
        isAvailable: true
      }
    ]
  },
  receiveActions: async ({ subdomain, data }) => {
    const { config } = data?.action || {};

    const title = `${config?.broadcastName} - created from automation  ${moment().format('YYYY-MM-DD HH:mm')}`;

    const models = await generateModels(subdomain);

    const sourceCampaign = await models.EngageMessages.getEngageMessage(
      config.broadcastId
    );

    const doc = {
      ...sourceCampaign.toObject(),
      createdAt: new Date(),
      title,
      isDraft: true,
      isLive: false,
      runCount: 0,
      totalCustomersCount: 0,
      validCustomersCount: 0
    };

    delete doc._id;

    const copy = await models.EngageMessages.createEngageMessage(doc);

    const live = await models.EngageMessages.engageMessageSetLive(copy._id);

    await send(models, subdomain, live);
    return live;
  }
};
