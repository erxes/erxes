import { sendCommonMessage } from '../../messageBroker';
import { getDailyData } from '../../utils';

const queries = {
  async videoCallUsageStatus(_root, _args, { models, subdomain }) {
    const type = await sendCommonMessage({
      serviceName: 'integrations',
      action: 'configs.findOne',
      subdomain,
      data: { code: 'VIDEO_CALL_TYPE' },
      isRPC: true
    });

    if (!type || type.value !== 'daily') {
      throw new Error(
        'Video call configs not found. Please setup video call configs from integrations settings.'
      );
    }

    return getDailyData(subdomain);
  }
};

export default queries;
