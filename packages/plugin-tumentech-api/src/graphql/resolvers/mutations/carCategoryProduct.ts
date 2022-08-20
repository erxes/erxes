import { checkPermission } from '@erxes/api-utils/src';

import { sendProductsMessage } from '../../../messageBroker';

const carCategoryProductMutations = {
  carCategoryMatch: async (_root, doc, { models, subdomain }) => {
    const { carCategoryId, productCategoryIds = [] } = doc;

    const dbProductIds = (
      (await models.ProductCarCategories.find({ carCategoryId }).lean()) || []
    ).map(i => i.productCategoryId);

    const toDelProductIds = dbProductIds.filter(
      p => !productCategoryIds.includes(p)
    );
    const toInsProductIds = productCategoryIds.filter(
      p => !dbProductIds.includes(p)
    );

    if (toDelProductIds.length) {
      await models.ProductCarCategories.deleteMany({
        carCategoryId,
        productCategoryId: { $in: toDelProductIds }
      });
    }

    if (toInsProductIds.length) {
      const bulkOps: any[] = [];

      for (const productCategoryId of toInsProductIds) {
        bulkOps.push({
          carCategoryId,
          productCategoryId
        });
      }

      await models.ProductCarCategories.insertMany(bulkOps);
    }

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        query: {
          _id: { $in: productCategoryIds }
        }
      },
      isRPC: true,
      defaultValue: []
    });

    return {
      carCategoryId,
      productCategoryIds,
      products
    };
  },

  productMatch: async (_root, doc, { models, subdomain }) => {
    const { productCategoryId, carCategoryIds = [] } = doc;

    const dbcarCategoryIds = (
      (await models.ProductCarCategories.find({ productCategoryId }).lean()) ||
      []
    ).map(i => i.carCategoryId);

    const toDelCarCategoryIds = dbcarCategoryIds.filter(
      p => !carCategoryIds.includes(p)
    );
    const toInsCarCategoryIds = carCategoryIds.filter(
      p => !dbcarCategoryIds.includes(p)
    );

    if (toDelCarCategoryIds.length) {
      await models.ProductCarCategories.deleteMany({
        productCategoryId,
        carCategoryId: { $in: toDelCarCategoryIds }
      });
    }

    if (toInsCarCategoryIds.length) {
      const bulkOps: any[] = [];

      for (const carCategoryId of toInsCarCategoryIds) {
        bulkOps.push({
          productCategoryId,
          carCategoryId
        });
      }

      await models.ProductCarCategories.insertMany(bulkOps);
    }

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        query: {
          _id: { $in: carCategoryIds }
        }
      },
      isRPC: true,
      defaultValue: []
    });

    return {
      productCategoryId,
      carCategoryIds,
      products
    };
  }
};

checkPermission(carCategoryProductMutations, 'carCategoryMatch', 'manageCars');
checkPermission(carCategoryProductMutations, 'productMatch', 'manageCars');

export default carCategoryProductMutations;
