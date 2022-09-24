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
   * remove a template
   */
  async paymentConfigsEdit(
    _root,
    {
      id,
      name,
      status,
      type,
      config
    }: { id: string; name: string; status: string; type: string; config: any },
    { models }: IContext
  ) {
    console.log('paymentConfigsEdit: ', id, name, status, type, config);

    return await models.PaymentConfigs.updatePaymentConfig(id, {
      name,
      status,
      type,
      config
    });
  },

  /**
   *  create an invoice
   */
  async createInvoice(_root, params, { subdomain, models }: IContext) {
    const {
      paymentId,
      amount,
      description,
      phone,
      customerId,
      companyId,
      contentType,
      contentTypeId
    } = params;
    console.log(params);
    const paymentConfig = await models.PaymentConfigs.findOne({
      _id: paymentId
    });

    if (!paymentConfig) {
      console.log(`/pl:posclient/callBackQpay`);
      throw new Error(`Not found payment config`);
    }

    const { config, type } = paymentConfig;

    const data = {
      config,
      amount,
      invoice_description: description,
      phone,
      customerId,
      companyId,
      contentType,
      contentTypeId
    };

    const messageBrokerResponse =
      type.toLowerCase() === 'qpay'
        ? await sendQpayMessage({
            subdomain,
            action: 'createInvoice',
            data,
            isRPC: true
          })
        : await sendSocialPayMessage({
            subdomain,
            action: 'createInvoice',
            data,
            isRPC: true
          });

    console.log('messageBrokerResponse:', messageBrokerResponse);

    return [messageBrokerResponse];
  }
};

requireLogin(paymentConfigMutations, 'paymentConfigsAdd');
requireLogin(paymentConfigMutations, 'paymentConfigRemove');

export default paymentConfigMutations;
