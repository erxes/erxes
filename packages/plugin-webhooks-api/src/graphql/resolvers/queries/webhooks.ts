import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src/core';
import { getService, getServices } from '@erxes/api-utils/src/serviceDiscovery';

interface IListParams {
  page: number;
  perPage: number;
  searchValue: string;
}

const generateFilter = (args: IListParams) => {
  const { searchValue } = args;

  const filter: any = {};

  if (searchValue) {
    filter.url = new RegExp(`.*${searchValue}.*`, 'i');
  }

  return filter;
};

const webhookQueries = {
  /**
   * Webhooks list
   */
  async webhooks(_root, _args: IListParams, { models }: IContext) {
    const filter = generateFilter(_args);

    return paginate(models.Webhooks.find(filter), _args);
  },

  /**
   * Get one Webhook
   */
  async webhookDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Webhooks.findOne({ _id });
  },

  async webhooksTotalCount(
    _root,
    _args: IListParams,
    { commonQuerySelector, models }: IContext,
  ) {
    const filter = generateFilter(_args);

    return models.Webhooks.find({
      ...commonQuerySelector,
      ...filter,
    }).countDocuments();
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
