import { Webhooks } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

const webhookQueries = {
  /**
   * Webhooks list
   */
  webhooks(_root) {
    return Webhooks.find({});
  },

  /**
   * Get one Webhook
   */
  webhookDetail(_root, { _id }: { _id: string }) {
    return Webhooks.findOne({ _id });
  },

  async webhooksTotalCount(_root, { commonQuerySelector }: IContext) {
    return Webhooks.find({ ...commonQuerySelector }).countDocuments();
  },
};

requireLogin(webhookQueries, 'webhookDetail');
checkPermission(webhookQueries, 'webhooks', 'showWebhooks', []);

export default webhookQueries;
