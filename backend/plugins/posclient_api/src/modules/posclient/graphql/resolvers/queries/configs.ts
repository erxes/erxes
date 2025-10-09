import { IContext } from '~/modules/posclient/@types/types';
import { checkSlotStatus } from '~/modules/posclient/utils/slots';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

const configQueries = {
  async currentConfig(_root, _args, { models, config }: IContext) {
    if (!config) {
      const confCount = await models.Configs.find({
        status: { $ne: 'deleted' },
      }).countDocuments();

      if (!confCount) {
        return {};
      }

      if (confCount === 1) {
        return await models.Configs.findOne({
          status: { $ne: 'deleted' },
        }).lean();
      }

      throw new Error('not found currentConfig');
    }
    return config;
  },

  async posclientConfigs(_root, _args, { models }: IContext) {
    return models.Configs.find({ status: { $ne: 'deleted' } }).lean();
  },

  async poscSlots(_root, _args, { models, config }: IContext) {
    const slots = await models.PosSlots.find({ posToken: config.token }).lean();
    return await checkSlotStatus(models, config, slots);
  },

  async getBranches(_root, _param, { subdomain, config }: IContext) {
    if (!config) {
      return {};
    }
    return await sendTRPCMessage({
      method: 'query',
      pluginName: 'sales',
      module: 'pos',
      action: 'ecommerceGetBranches',
      input: { query: { posToken: config.token || '' } },
      defaultValue: {},
    });
  },
};

export default configQueries;
