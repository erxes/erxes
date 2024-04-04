import { paginate } from '@erxes/api-utils/src/core';
import { IContext } from '../../../connectionResolver';

const queries = {
  getPaymentConfig(
    _root,
    args: { contentType: string; contentTypeId: string },
    { models }: IContext
  ) {
    return models.PaymentConfigs.getConfig(args);
  },

  async getPaymentConfigs(
    _root,
    args: { contentType: string; page: number; perPage: number },
    { models }: IContext
  ) {
    const { contentType, page, perPage } = args;
    const filter = {} as any;

    if (contentType) {
      filter.contentType = contentType;
    }

    return paginate(models.PaymentConfigs.find(filter).lean(), {
      page: page || 1,
      perPage: perPage || 20
    });
  },

  async paymentConfigsTotalCount(_root, _args, { models }: IContext) {
    return models.PaymentConfigs.find().countDocuments();
  }
};

export default queries;
