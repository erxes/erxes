import { IContext } from '../../connectionResolvers';
import { sendCommonMessage } from '../../messageBroker';
import { Polarissyncs } from '../../models';

const polarissyncQueries = {
  polarisGetData(_root, { customerId }, _context: IContext) {
    return Polarissyncs.findOne({ customerId });
  },

  async polarisGetConfigs(_root, _args, { subdomain }: IContext) {
    const configs = await sendCommonMessage({
      serviceName: 'core',
      action: 'configs.find',
      data: {
        code: { $in: ['POLARIS_API_URL', 'POLARIS_API_TOKEN'] }
      },
      subdomain,
      isRPC: true,
      defaultValue: []
    });

    const configMap: any = {
      POLARIS_API_URL: 'https://crm-api.bid.mn/api/v1',
      POLARIS_API_TOKEN: 'token'
    };

    if (configs && configs.length > 0) {
      configs.forEach(config => {
        configMap[config.code] = config.value;
      });
    }

    return configMap;
  }
};

export default polarissyncQueries;
