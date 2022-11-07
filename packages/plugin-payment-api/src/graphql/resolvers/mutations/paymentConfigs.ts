import { IContext } from '../../../connectionResolver';
import { IPaymentConfig } from '../../../models/definitions/paymentConfigs';

const mutations = {
  async paymentConfigsAdd(_root, args: IPaymentConfig, { models }: IContext) {
    return models.PaymentConfigs.createConfig(args);
  },

  async paymentConfigsEdit(
    _root,
    { _id, paymentIds }: { _id: string; paymentIds: string[] },
    { models }: IContext
  ) {
    return models.PaymentConfigs.updateConfig(_id, paymentIds);
  },

  async paymentConfigsRemove(
    _root,
    args: { _id: string },
    { models }: IContext
  ) {
    return models.PaymentConfigs.removeConfig(args._id);
  }
};

export default mutations;
