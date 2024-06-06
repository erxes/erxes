
import { IContext } from '../../../connectionResolver';
import { getAuthHeaders } from '../../../utils/utils';
import { IGolomtBankConfig } from '../../../models/definitions/golomtBankConfigs';

const mutations = {
  async golomtBankConfigsAdd(_root, args: IGolomtBankConfig, { models }: IContext) {

    // const name = args.name;
    // const organizationName = args.organizationName;
    // const ivKey = args.ivKey;
    // const sessionKey = args.sessionKey;
    // const clientId = args.clientId;
    // const configPassword = args.configPassword;
    // const registerId =  args.registerId;

    //   await getAuthHeaders({
    //     name: name,
    //     organizationName: organizationName,
    //     ivKey: ivKey,
    //     sessionKey: sessionKey,
    //     clientId: clientId,
    //     configPassword: configPassword,
    //     registerId: registerId
    //   });
      return await models.GolomtBankConfigs.createConfig(args);

  },

  async golomtBankConfigsEdit(
    _root,
    args: {
      _id: string;
    } & IGolomtBankConfig,
    { models }: IContext
  ) {
    const name = args.name;
    const organizationName = args.organizationName;
    const ivKey = args.ivKey;
    const sessionKey = args.sessionKey;
    const clientId = args.clientId;
    const configPassword = args.configPassword;
    const registerId =  args.registerId;
    const accountId =  args.accountId;

    try {
    //   await getAuthHeaders({
    //     name: name,
    //     organizationName: organizationName,
    //     ivKey: ivKey,
    //     sessionKey: sessionKey,
    //     clientId: clientId,
    //     configPassword: configPassword,
    //     registerId: registerId
    //   });

      return models.GolomtBankConfigs.updateConfig(args._id, args);
    } catch (e) {
      throw new Error('Unable to authenticate with the provided credentials');
    }
  },

  async golomtBankConfigsRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.GolomtBankConfigs.removeConfig(_id);
  }
};



export default mutations;
