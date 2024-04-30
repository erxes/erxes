import { checkPermission, requireLogin } from '@erxes/api-utils/src';
import { IGolomtBankConfig } from '../../../models/definitions/golomtBankConfigs'
import { IContext } from '../../../connectionResolver';
import { getAuthHeaders } from '../../../utils/utils';import { config } from 'process';
;

const mutations = {
  async createGolomtStatement(_root, config: IGolomtBankConfig, { models }: IContext) {
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


};

requireLogin(mutations, 'createGolomtStatement');


export default mutations;