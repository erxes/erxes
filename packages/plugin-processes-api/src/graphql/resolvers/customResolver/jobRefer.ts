import { IJobReferDocument } from '../../../models/definitions/jobs';
import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';

const getProductAndUoms = async (subdomain, productsData) => {
  const productIds = productsData.map(n => n.productId);

  const products = await sendProductsMessage({
    subdomain,
    action: 'find',
    data: { query: { _id: { $in: productIds } } },
    isRPC: true,
    defaultValue: []
  });

  const productById = {};
  for (const product of products) {
    productById[product._id] = product;
  }

  const uomIds = productsData.map(n => n.uomId);
  const uoms = await sendProductsMessage({
    subdomain,
    action: 'findUom',
    data: { _id: { $in: uomIds } },
    isRPC: true,
    defaultValue: []
  });

  const uomById = {};
  for (const uom of uoms) {
    uomById[uom._id] = uom;
  }
  return { productById, uomById };
};

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

    for await (const need of needProducts) {
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

    for await (const result of resultProducts) {
      result.product = productById[result.productId] || {};
      result.uom = uomById[result.uomId] || {};
    }

    return resultProducts;
  }
};
