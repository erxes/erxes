import { requireLogin } from '@erxes/api-utils/src/permissions';

import { IContext } from '../../connectionResolver';
import { IPaymentConfig } from '../../models/definitions/payments';

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
  async createInvoice(_root, params, { models }: IContext) {
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
    const paymentConfig = await models.PaymentConfigs.findOne({
      _id: paymentId
    });

    if (!paymentConfig) {
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

    const response =
      type.toLowerCase() === 'qpay'
        ? await models.QpayInvoices.createInvoice(data)
        : await models.SocialPayInvoices.createInvoice(data);

    return response;
  }
};

requireLogin(paymentConfigMutations, 'paymentConfigsAdd');
requireLogin(paymentConfigMutations, 'paymentConfigRemove');

export default paymentConfigMutations;
