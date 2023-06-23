import { IJobReferDocument } from '../../../models/definitions/jobs';
import { IContext } from '../../../connectionResolver';
import { getProductAndUoms } from './utils';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.JobRefers.findOne({ _id }).lean();
  },

  async needProducts(jobRefer: IJobReferDocument, {}, { subdomain }: IContext) {
    const needProducts = jobRefer.needProducts || [];

    const { productById } = await getProductAndUoms(subdomain, needProducts);

    for (let need of needProducts) {
      need.product = productById[need.productId] || {};
      need.uom = (productById[need.productId] || {}).uom;
    }

    return needProducts;
  },

  async resultProducts(
    jobRefer: IJobReferDocument,
    {},
    { subdomain }: IContext
  ) {
    const resultProducts = jobRefer.resultProducts || [];

    const { productById } = await getProductAndUoms(subdomain, resultProducts);

    for (const result of resultProducts) {
      result.product = productById[result.productId] || {};
      result.uom = (productById[result.productId] || {}).uom;
    }

    return resultProducts;
  }
};
