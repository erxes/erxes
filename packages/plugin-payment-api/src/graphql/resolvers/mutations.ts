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
  // ,
  // /**
  //  * Creates a new template
  //  */
  // async paymentConfigsRemove(_root, doc: IPaymentConfig, { models }: IContext) {
  //   await models.PaymentConfigs.removePayme;

  //   return 'success';
  // }
};

requireLogin(paymentConfigMutations, 'paymentConfigsAdd');

export default paymentConfigMutations;
