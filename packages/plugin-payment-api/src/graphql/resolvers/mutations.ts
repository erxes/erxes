import { requireLogin } from '@erxes/api-utils/src/permissions';

import { IContext } from '../../connectionResolver';
import { IInvoice } from '../../models/definitions/invoices';
import { IPaymentConfig } from '../../models/definitions/paymentConfigs';

const paymentConfigMutations = {
  async paymentConfigsAdd(_root, doc: IPaymentConfig, { models }: IContext) {
    const paymentConfig = await models.PaymentConfigs.createPaymentConfig(doc);

    return paymentConfig;
  },

  async paymentConfigRemove(
    _root,
    { id }: { id: string },
    { models }: IContext
  ) {
    await models.PaymentConfigs.removePaymentConfig(id);

    return 'success';
  },

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
  async invoiceCreate(_root, params: IInvoice, { models }: IContext) {
    try {
      return models.Invoices.createInvoice(params);
    } catch (e) {
      throw new Error(e.message);
    }
  },

  /**
   * cancel an invoice
   */

  async invoiceCancel(_root, { _id }: { _id: string }, { models }: IContext) {
    try {
      return models.Invoices.cancelInvoice(_id);
    } catch (e) {
      throw new Error(e.message);
    }
  }
};

requireLogin(paymentConfigMutations, 'paymentConfigsAdd');
requireLogin(paymentConfigMutations, 'paymentConfigRemove');

export default paymentConfigMutations;
