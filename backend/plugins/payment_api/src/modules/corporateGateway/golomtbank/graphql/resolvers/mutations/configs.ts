import { IContext } from '~/connectionResolvers';
import { IGolomtBankConfig } from '~/modules/corporateGateway/golomtbank/@types/golomtBank';

const mutations = {
  async golomtBankConfigsAdd(
    _root,
    args: IGolomtBankConfig,
    { models }: IContext,
  ) {
    return await models.GolomtBankConfigs.createConfig(args);
  },

  async golomtBankConfigsEdit(
    _root,
    args: {
      _id: string;
    } & IGolomtBankConfig,
    { models }: IContext,
  ) {
    try {
      return await models.GolomtBankConfigs.updateConfig(args._id, args);
    } catch (e) {
      throw new Error('Unable to authenticate with the provided credentials');
    }
  },

  async golomtBankConfigsRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.GolomtBankConfigs.removeConfig(_id);
  },
};

export default mutations;
