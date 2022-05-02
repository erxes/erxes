import { checkPermission, requireLogin } from '@erxes/api-utils/src/permissions';
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

  async webhooksTotalCount(_root, _args, { commonQuerySelector, models }: IContext) {
    return models.Webhooks.find({ ...commonQuerySelector }).countDocuments();
  }
};

requireLogin(webhookQueries, 'webhookDetail');
checkPermission(webhookQueries, 'webhooks', 'showWebhooks', []);

export default webhookQueries;
