import { IContext } from '../../connectionResolver';
import { sendCommonMessage } from '../../messageBroker';

const polarissyncQueries = {
  bidGetPolarisData(_root, { customerId }, { models }: IContext) {
    return models.Polarissyncs.findOne({ customerId });
  },

  async bidGetConfigs(_root, _args, { subdomain }: IContext) {
    const configs = await sendCommonMessage({
      serviceName: 'core',
      action: 'configs.find',
      data: {
        code: { $in: ['POLARIS_API_URL', 'POLARIS_API_TOKEN'] },
      },
      subdomain,
      isRPC: true,
      defaultValue: [],
    });

    const configMap: any = {
      POLARIS_API_URL: 'https://crm-api.bid.mn/api/v1',
      POLARIS_API_TOKEN: 'token',
    };

    if (configs && configs.length > 0) {
      configs.forEach((config) => {
        configMap[config.code] = config.value;
      });
    }

    return configMap;
  },
};

export default polarissyncQueries;
