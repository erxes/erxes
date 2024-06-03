import { checkPermission, requireLogin } from '@erxes/api-utils/src';
import { IGolomtBankConfig } from '../../../models/definitions/golomtBankConfigs'
import { IContext } from '../../../connectionResolver';
import { getAuthHeaders } from '../../../utils/utils';import { config } from 'process';
;

const mutations = {
  async createGolomtConfig(_root, config: IGolomtBankConfig, { models }: IContext) {
    const key = config.consumerKey;
    const secret = config.secretKey;

    try {
      await getAuthHeaders({
        consumerKey: key,
        secretKey: secret
      });

      return models.GolomtBankConfig.createConfig(config);
    } catch (e) {
      throw new Error('Unable to authenticate with the provided credentials');
    }
  },

  async updateGolomtConfigs(
    _root,
    args: {
      _id: string;
    } & IGolomtBankConfig,
    { models }: IContext
  ) {
    const key = args.consumerKey;
    const secret = args.secretKey;

    try {
      await getAuthHeaders({
        consumerKey: key,
        secretKey: secret
      });

      return models.GolomtBankConfig.updateConfig(args._id, args);
    } catch (e) {
      throw new Error('Unable to authenticate with the provided credentials');
    }
  },

  async removeGolomtConfig(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.GolomtBankConfig.removeConfig(_id);
  }
};

requireLogin(mutations, 'khanbankConfigsAdd');
requireLogin(mutations, 'khanbankConfigsEdit');
requireLogin(mutations, 'khanbankConfigsRemove');

checkPermission(mutations, 'khanbankConfigsAdd', 'khanbankConfigsAdd', []);
checkPermission(mutations, 'khanbankConfigsEdit', 'khanbankConfigsEdit', []);
checkPermission(
  mutations,
  'khanbankConfigsRemove',
  'khanbankConfigsRemove',
  []
);

export default mutations;
