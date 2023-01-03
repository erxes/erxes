import { IContext } from '../../connectionResolver';
import { sendInboxMessage } from '../../messageBroker';
import { IPaymentConfig } from '../../models/definitions/paymentConfigs';
import { serviceDiscovery } from '../../configs';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.PaymentConfigs.findOne({ _id });
  },

  async contentName(config: IPaymentConfig, {}, { subdomain }: IContext) {
    if (config.contentType.includes('integrations')) {
      if (!(await serviceDiscovery.isEnabled('inbox'))) {
        return 'Inbox service is not enabled';
      }

      const integration = await sendInboxMessage({
        subdomain,
        action: 'integrations.findOne',
        data: { _id: config.contentTypeId },
        isRPC: true,
        defaultValue: null
      });

      return integration ? integration.name : 'Integration not found';
    }

    /// TODO: add other content types
    return config.contentTypeId;
  },

  async payments(config: IPaymentConfig, {}, { models }: IContext) {
    return models.Payments.find({ _id: { $in: config.paymentIds } }).lean();
  }
};
