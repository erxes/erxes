import { IContext } from '../../../connectionResolver';
import { IGrantConfigsDocument } from '../../../models/definitions/grant';

const GrantConfigsMutations = {
  async addGrantConfig(_root, args, { models, user }: IContext) {
    return await models.Configs.addConfig(args);
  },

  async editGrantConfig(
    _root,
    { _id, ...doc }: IGrantConfigsDocument,
    { models }: IContext
  ) {
    return await models.Configs.editConfig(_id, doc);
  },

  async removeGrantConfig(_root, { _id }, { models }: IContext) {
    return await models.Configs.removeConfig(_id);
  }
};

export default GrantConfigsMutations;
