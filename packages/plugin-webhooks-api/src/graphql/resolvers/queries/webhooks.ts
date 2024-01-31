import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';
import { getService, getServices } from '@erxes/api-utils/src/serviceDiscovery';

const webhookQueries = {
  /**
   * Webhooks list
   */
  webhooks(_root, _args, { models }: IContext) {
    return models.Webhooks.find({});
  },

  /**
   * Get one Webhook
   */
  webhookDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Webhooks.findOne({ _id });
  },

  async webhooksTotalCount(
    _root,
    _args,
    { commonQuerySelector, models }: IContext,
  ) {
    return models.Webhooks.find({ ...commonQuerySelector }).countDocuments();
  },

  async webhooksGetActions(_root) {
    const services = await getServices();
    const webhookActions: any = [];

    for (const serviceName of services) {
      const service = await getService(serviceName);
      const meta = service.config?.meta || {};

      if (meta && meta.webhooks) {
        const actions = meta.webhooks.actions || [];

        for (const action of actions) {
          webhookActions.push({
            label: action.label,
            action: action.action,
            type: action.type,
          });
        }
      }
    }

    return webhookActions;
  },
};

requireLogin(webhookQueries, 'webhookDetail');
checkPermission(webhookQueries, 'webhooks', 'showWebhooks', []);

export default webhookQueries;
