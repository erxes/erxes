import { IContext } from '../../connectionResolver';
import { sendCardsMessage } from '../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Issues.findOne({ _id });
  },

  async labels({ labelIds }, {}, { subdomain }: IContext) {
    return await sendCardsMessage({
      subdomain,
      action: 'pipelineLabels.find',
      data: { query: { _id: { $in: labelIds } } },
      isRPC: true,
      defaultValue: []
    });
  }
};
