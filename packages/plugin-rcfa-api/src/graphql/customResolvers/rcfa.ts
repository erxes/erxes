import { IContext } from '../../connectionResolver';

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
  }
};
