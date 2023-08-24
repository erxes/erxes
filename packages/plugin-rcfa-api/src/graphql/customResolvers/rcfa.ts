import { IContext } from '../../connectionResolver';
import { sendCardsMessage } from '../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RCFA.findOne({ _id });
  },
  async issues({ _id }, {}, { models }: IContext) {
    return (await models.Issues.find({ rcfaId: _id })) || null;
  },
  async mainTypeDetail({ mainTypeId }, {}, { subdomain }: IContext) {
    if (!mainTypeId) return null;

    return {
      __typename: 'Ticket',
      _id: mainTypeId
    };
  },
  async relTypeDetail({ relTypeId }, {}, { subdomain }: IContext) {
    if (!relTypeId) return null;

    return {
      __typename: 'Task',
      _id: relTypeId
    };
  }
};
