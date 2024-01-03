import { IContext } from '../../connectionResolver';
import { sendCardsMessage } from '../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RCFA.findOne({ _id });
  },
  async issues({ _id }, {}, { models }: IContext) {
    return (await models.Issues.find({ rcfaId: _id })) || null;
  },
  async mainTypeDetail({ mainTypeId }) {
    if (!mainTypeId) return null;

    return {
      __typename: 'Ticket',
      _id: mainTypeId
    };
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
