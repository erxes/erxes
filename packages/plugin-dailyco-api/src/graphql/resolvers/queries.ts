import { sendRequest } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';
import { sendCommonMessage } from '../../messageBroker';
import {
  Conversations,
  ConversationMessages,
  Integrations,
  IConversationMessages
} from '../../models';

const queries = {
  async videoCallUsageStatus(_root, _args, { models, subdomain }: IContext) {
    const type = await sendCommonMessage({
      serviceName: 'integrations',
      action: 'configs.findOne',
      subdomain,
      data: { code: 'VIDEO_CALL_TYPE' },
      isRPC: true
    });

    if (!type || type !== 'dailyco') {
      throw new Error(
        'Video call configs not found. Please setup video call configs from integrations settings.'
      );
    }

    const keys = ['DAILY_API_KEY', 'DAILY_END_POINT'];

    const selector = { code: { $in: keys } };

    const configs = await sendCommonMessage({
      serviceName: 'integrations',
      action: 'configs.find',
      subdomain,
      data: { selector },
      isRPC: true
    });

    if (!configs || configs.length === 0) {
      throw new Error(
        'Video call configs not found. Please setup video call configs from integrations settings.'
      );
    }

    const DAILY_API_KEY = configs.find(
      (config: any) => config.code === 'DAILY_API_KEY'
    ).value;

    const response = await sendRequest({
      url: 'https://api.daily.co/v1',
      method: 'get',
      headers: { Authorization: `Bearer ${DAILY_API_KEY}` }
    });

    if (!response) {
      throw new Error(
        'Error while fetching video call usage status. Please try again later.'
      );
    }

    if (response.error) {
      if (response.error === 'authentication-error') {
        throw new Error(
          'Invalid daily api key. Please check your daily api key.'
        );
      }

      throw new Error(response.error);
    }

    return response;
  }
};

export default queries;
