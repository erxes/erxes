import { IContext } from '../../../connectionResolver';
import { sendPosMessage } from '../../../messageBroker';

const configQueries = {
  async currentConfig(_root, _args, { models, config }: IContext) {
    if (!config) {
      const confCount = await models.Configs.find({
        status: { $ne: 'deleted' }
      }).count();

      if (!confCount) {
        return {};
      }

      if (confCount === 1) {
        return await models.Configs.findOne({
          status: { $ne: 'deleted' }
        }).lean();
      }

      throw new Error('not found currentConfig');
    }
    return config;
  },

  async posclientConfigs(_root, _args, { models }: IContext) {
    return models.Configs.find({ status: { $ne: 'deleted' } }).lean();
  },

  poscSlots(_root, _args, { models, config }: IContext) {
    return models.PosSlots.find({ posId: config.posId }).lean();
  },

  async getBranches(_root, _param, { subdomain, config }: IContext) {
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
