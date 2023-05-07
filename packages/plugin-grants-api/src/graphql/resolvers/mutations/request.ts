import { IContext } from '../../../connectionResolver';

const GrantRequestMutations = {
  async addGrantRequest(_root, args, { models }: IContext) {
    return await models.Requests.addGrantRequest(args);
  },

  async editGrantRequest(_root, args, { models }: IContext) {
    return await models.Requests.editGrantRequest(args);
  },

  async cancelGrantRequest(_root, { cardId, cardType }, { models }: IContext) {
    return await models.Requests.cancelGrantRequest(cardId, cardType);
  }
};

export default GrantRequestMutations;
