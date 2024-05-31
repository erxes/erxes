import { checkPermission, requireLogin } from '@erxes/api-utils/src';
import { IGolomtBankConfig } from '../../../models/definitions/golomtBankConfigs'
import { IContext } from '../../../connectionResolver';
import { getAuthHeaders } from '../../../utils/utils';import { config } from 'process';
;

const mutations = {
  async createGolomtConfig(_root, config: IGolomtBankConfig, { models }: IContext) {
    const userName = config.userName;
    const organizationName = config.organizationName;
    const ivKey = config.ivKey;
    const sessionKey = config.sessionKey;
    const clientId = config.clientId;
    const password = config.password;
    try {
      await getAuthHeaders({
        userName: userName,
        organizationName: organizationName,
        ivKey: ivKey,
        sessionKey: sessionKey,
        clientId: clientId,
        password: password
      });

      return models.GolomtBankConfigs.createConfig(config);
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
    const userName = args.userName;
    const organizationName = args.organizationName;
    const ivKey = args.ivKey;
    const sessionKey = args.sessionKey;
    const clientId = args.clientId;
    const password = args.password;

    try {
      await getAuthHeaders({
        userName: userName,
        organizationName: organizationName,
        ivKey: ivKey,
        sessionKey: sessionKey,
        clientId: clientId,
        password: password
      });

      return models.GolomtBankConfigs.updateConfig(args._id, args);
    } catch (e) {
      throw new Error('Unable to authenticate with the provided credentials');
    }
  },

  async removeGolomtConfig(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.GolomtBankConfigs.removeConfig(_id);
  }
};

export default mutations;
