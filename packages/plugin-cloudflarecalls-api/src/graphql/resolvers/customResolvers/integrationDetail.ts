import { IContext } from '../../../connectionResolver';
import { sendIntegrationsMessage } from '../../../messageBroker';

export default {
  async integrationDetail(args, {}, { subdomain }: IContext) {
    const { erxesApiId } = args;

    if (!erxesApiId) {
      return null;
    }

    try {
      const int = await sendIntegrationsMessage({
        subdomain,
        action: 'api_to_integrations',
        data: {
          inboxId: erxesApiId,
          action: 'getDetails',
        },
        isRPC: true,
      });

      return int;
    } catch (error) {
      throw error;
    }
  },
};
