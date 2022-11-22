import { IProductsData } from '../../../models/definitions/jobs';
import { sendProductsMessage } from '../../../messageBroker';

export const getProductAndUoms = async (
  subdomain: string,
  productsData: IProductsData[]
) => {
  const productById = {};
  const uomById = {};

  if (!productsData || !productsData.length) {
    return { productById, uomById };
  }

  const productIds = productsData
    .filter(n => n.productId)
    .map(n => n.productId);

  if (productIds.length) {
    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: { query: { _id: { $in: productIds } } },
      isRPC: true,
      defaultValue: []
    });

    for (const product of products) {
      productById[product._id] = product;
    }
  }

  const uomIds = productsData.map(n => n.uomId);

  if (uomIds.length) {
    const uoms = await sendProductsMessage({
      subdomain,
      action: 'uoms.find',
      data: { _id: { $in: uomIds } },
      isRPC: true,
      defaultValue: []
    });

    for (const uom of uoms) {
      uomById[uom._id] = uom;
    }
  }

  return { productById, uomById };
};
