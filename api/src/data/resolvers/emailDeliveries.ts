import { IEmailDeliveriesDocument } from '../../db/models/definitions/emailDeliveries';
import { getDocument } from './mutations/cacheUtils';

export default {
  async fromUser(emailDelivery: IEmailDeliveriesDocument) {
    return (await getDocument('users', { _id: emailDelivery.userId })) || {};
  },

  async fromEmail(emailDelivery: IEmailDeliveriesDocument) {
    const integration = await getDocument('integrations', {
      _id: emailDelivery.from
    });

    return integration ? integration.name : '';
  }
};
