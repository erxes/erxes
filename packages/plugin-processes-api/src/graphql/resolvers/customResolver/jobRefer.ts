import { IJobReferDocument } from '../../../models/definitions/jobs';
import { IContext } from '../../../connectionResolver';
import { getProductAndUoms } from './utils';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.JobRefers.findOne({ _id });
  },

  async needProducts(jobRefer: IJobReferDocument, {}, { subdomain }: IContext) {
    const needProducts = jobRefer.needProducts || [];

    const { productById, uomById } = await getProductAndUoms(
      subdomain,
      needProducts
    );

    for (const need of needProducts) {
      need.product = productById[need.productId] || {};
      need.uom = uomById[need.uomId] || {};
    }

    return needProducts;
  },

  async resultProducts(
    jobRefer: IJobReferDocument,
    {},
    { subdomain }: IContext
  ) {
    const resultProducts = jobRefer.resultProducts || [];

    const { productById, uomById } = await getProductAndUoms(
      subdomain,
      resultProducts
    );

    for (const result of resultProducts) {
      result.product = productById[result.productId] || {};
      result.uom = uomById[result.uomId] || {};
    }

    return resultProducts;
  }
};
