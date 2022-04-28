import { checkPermission } from '@erxes/api-utils/src';
import { sendCoreMessage, sendProductsMessage } from '../../../messageBroker';

const carCategoryProductMutations = {
  carCategoryMatch: async (_root, doc, { models, subdomain }) => {
    const { carCategoryId, productIds = [] } = doc;

    const dbProductIds = (
      (await models.ProductCarCategory.find({ carCategoryId }).lean()) || []
    ).map((i) => i.productId);

    const toDelProductIds = dbProductIds.filter((p) => !productIds.includes(p));
    const toInsProductIds = productIds.filter((p) => !dbProductIds.includes(p));

    if (toDelProductIds.length) {
      await models.ProductCarCategory.deleteMany({
        carCategoryId,
        productId: { $in: toDelProductIds }
      });
    }

    if (toInsProductIds.length) {
      const bulkOps: any[] = [];

      for (const productId of toInsProductIds) {
        bulkOps.push({
          carCategoryId,
          productId
        });
      }

      await models.ProductCarCategory.insertMany(bulkOps);
    }

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        query: {
          _id: { $in: productIds }
        }
      },
      isRPC: true,
      defaultValue: []
    });

    return {
      carCategoryId,
      productIds,
      products
    };
  },

  productMatch: async (_root, doc, { models, subdomain }) => {
    const { productId, carCategoryIds = [] } = doc;

    const dbcarCategoryIds = (
      (await models.ProductCarCategory.find({ productId }).lean()) || []
    ).map((i) => i.carCategoryId);

    const toDelCarCategoryIds = dbcarCategoryIds.filter(
      (p) => !carCategoryIds.includes(p)
    );
    const toInsCarCategoryIds = carCategoryIds.filter(
      (p) => !dbcarCategoryIds.includes(p)
    );

    if (toDelCarCategoryIds.length) {
      await models.ProductCarCategory.deleteMany({
        productId,
        carCategoryId: { $in: toDelCarCategoryIds }
      });
    }

    if (toInsCarCategoryIds.length) {
      const bulkOps: any[] = [];

      for (const carCategoryId of toInsCarCategoryIds) {
        bulkOps.push({
          productId,
          carCategoryId
        });
      }

      await models.ProductCarCategory.insertMany(bulkOps);
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
      productId,
      carCategoryIds,
      products
    };
  }
};

checkPermission(carCategoryProductMutations, 'carCategoryMatch', 'manageCars');
checkPermission(carCategoryProductMutations, 'productMatch', 'manageCars');

export default carCategoryProductMutations;
