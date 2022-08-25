import { IContext } from '../../connectionResolver';
import { requireLogin } from '@erxes/api-utils/src/permissions';
import { IPaymentConfig } from '../../models/definitions/payment';
import { sendQpayMessage, sendSocialPayMessage } from '../../messageBroker';

const paymentConfigMutations = {
  /**
   * Creates a new template
   */
  async paymentConfigsAdd(_root, doc: IPaymentConfig, { models }: IContext) {
    const paymentConfig = await models.PaymentConfigs.createPaymentConfig(doc);

    return paymentConfig;
  },
  /**
   * remove a template
   */
  async paymentConfigRemove(
    _root,
    { id }: { id: string },
    { models }: IContext
  ) {
    await models.PaymentConfigs.removePaymentConfig(id);

    return 'success';
  },

  /**
   *  create an invoice
   */
  async createInvoice(_root, params, { subdomain, models }: IContext) {
    const { paymentId, amount } = params;
    console.log(params);
    const paymentConfig = await models.PaymentConfigs.findOne({
      _id: paymentId
    });

    if (!paymentConfig) {
      throw new Error(`Not found payment config`);
    }

    const { config, type } = paymentConfig;

    const messageBrokerResponse =
      type.toLowerCase() === 'qpay'
        ? await sendQpayMessage({
            subdomain,
            action: 'createInvoice',
            data: config,
            isRPC: true
          })
        : await sendSocialPayMessage({
            subdomain,
            action: 'createInvoice',
            data: config,
            isRPC: true
          });

    console.log('messageBrokerResponse:', messageBrokerResponse);

    return [config, messageBrokerResponse];
  }
};

requireLogin(paymentConfigMutations, 'paymentConfigsAdd');
requireLogin(paymentConfigMutations, 'paymentConfigRemove');

export default paymentConfigMutations;
