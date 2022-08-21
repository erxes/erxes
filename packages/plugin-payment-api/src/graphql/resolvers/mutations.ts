import { IContext } from '../../connectionResolver';
import { requireLogin } from '@erxes/api-utils/src/permissions';
import { IPaymentConfig } from '../../models/definitions/payment';

const paymentConfigMutations = {
  /**
   * Creates a new template
   */
  async paymentConfigsAdd(_root, doc: IPaymentConfig, { models }: IContext) {
    const paymentConfig = await models.PaymentConfigs.createPaymentConfig(doc);

    return paymentConfig;
  }
};

requireLogin(paymentConfigMutations, 'paymentConfigsAdd');

export default paymentConfigMutations;
