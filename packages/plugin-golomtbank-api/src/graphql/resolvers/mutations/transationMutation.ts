import { checkPermission, requireLogin } from '@erxes/api-utils/src';
import { IGolomtBankConfig } from '../../../models/definitions/golomtBankConfigs'
import { IContext } from '../../../connectionResolver';
import { getAuthHeaders } from '../../../utils/utils';


const mutations = {
  async createGolomtBankTransaction(_root, transactionRequest: IGolomtBankConfig, { models }: IContext) {
   

    try {
    

      return models.GolomtBankConfig.createConfig(transactionRequest);
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
