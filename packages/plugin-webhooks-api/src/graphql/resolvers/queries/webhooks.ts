import { checkPermission, requireLogin } from '@erxes/api-utils/src/permissions';
import { serviceDiscovery } from '../../../configs';
import { IContext } from '../../../connectionResolver';

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
    { commonQuerySelector, models }: IContext
  ) {
    return models.Webhooks.find({ ...commonQuerySelector }).countDocuments();
  },

  async webhooksGetActions(_root) {
    const services = await serviceDiscovery.getServices();
    const webhookActions: any  = [];

    for (const serviceName of services) {
      const service = await serviceDiscovery.getService(serviceName, true);
      const meta = service.config?.meta || {};

      if (meta && meta.webhooks) {
        const actions = meta.webhooks.actions || [];

        for (const action of actions) {
          webhookActions.push({
            // description: type.description,
            // contentType: `${serviceName}:${type.type}`,
            label: action.label,
            action: action.action,
            type:  action.type
          });
        }
      }
    }

    return webhookActions;
  }
};

// requireLogin(webhookQueries, 'webhookDetail');
// checkPermission(webhookQueries, 'webhooks', 'showWebhooks', []);

export default webhookQueries;

// { label: 'Customer created', action: 'create', type: 'customer' },
// { label: 'Customer updated', action: 'update', type: 'customer' },
// { label: 'Customer deleted', action: 'delete', type: 'customer' },
// { label: 'Company created', action: 'create', type: 'company' },
// { label: 'Company updated', action: 'update', type: 'company' },
// { label: 'Company deleted', action: 'delete', type: 'company' }, 