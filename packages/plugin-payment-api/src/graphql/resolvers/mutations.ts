import { requireLogin } from '@erxes/api-utils/src/permissions';

import { IContext } from '../../connectionResolver';
import { IPaymentConfig } from '../../models/definitions/payments';
import { cancelInvoice, createInvoice } from '../../utils';

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
  async createInvoice(_root, params, { models }: IContext) {
    return createInvoice(models, params);
  },
  /**
   * cancel an invoice
   */
  async cancelInvoice(_root, params, { models }: IContext) {
    return cancelInvoice(models, params);
  }
};

requireLogin(paymentConfigMutations, 'paymentConfigsAdd');
requireLogin(paymentConfigMutations, 'paymentConfigRemove');

export default paymentConfigMutations;
