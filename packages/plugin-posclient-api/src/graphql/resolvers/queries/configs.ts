import { IContext } from '../../../connectionResolver';
import { sendPosMessage } from '../../../messageBroker';

const configQueries = {
  currentConfig(_root, _args, { models }: IContext) {
    return models.Configs.findOne();
  },

  poscSlots(_root, _args, { models }: IContext) {
    return models.PosSlots.find().lean();
  },

  async getBranches(_root, _param, { models, subdomain }: IContext) {
    const config = await models.Configs.findOne({}).lean();

    return await sendPosMessage({
      subdomain,
      action: 'ecommerceGetBranches',
      data: { posToken: config.token || '' },
      isRPC: true,
      defaultValue: []
    });
  }
};

export default configQueries;
