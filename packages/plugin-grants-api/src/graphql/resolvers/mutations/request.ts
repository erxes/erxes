import { IContext } from '../../../connectionResolver';

const GrantRequestMutations = {
  async addGrantRequest(_root, args, { models, user }: IContext) {
    return await models.Requests.addGrantRequest(args, user);
  },

  async editGrantRequest(_root, args, { models, user }: IContext) {
    return await models.Requests.editGrantRequest(args, user);
  },

  async cancelGrantRequest(
    _root,
    { contentTypeId, contentType },
    { models }: IContext
  ) {
    return await models.Requests.cancelGrantRequest(contentTypeId, contentType);
  },
  async removeGrantRequest(_root, { ids }, { models }: IContext) {
    return await models.Requests.removeGrantRequest(ids);
  }
};

export default GrantRequestMutations;
