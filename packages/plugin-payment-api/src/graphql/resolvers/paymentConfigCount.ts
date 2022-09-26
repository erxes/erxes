import { IContext } from '../../connectionResolver';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.PaymentConfigs.findOne({ _id });
  },

  async qpay({}, {}, { models }: IContext) {
    return await models.PaymentConfigs.find({
      status: 'active',
      type: 'qpay'
    }).countDocuments();
  },
  async socialPay({}, {}, { models }: IContext) {
    return await models.PaymentConfigs.find({
      status: 'active',
      type: 'socialPay'
    }).countDocuments();
  },
  async total({}, {}, { models }: IContext) {
    return await models.PaymentConfigs.find({
      status: 'active'
    }).countDocuments();
  }
};
