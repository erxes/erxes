import { IProduct } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { refreshProductKnowledge } from '~/modules/products/meta/automations';

export const productMutations = {
  /**
   * Creates a new product
   * @param {Object} doc Product document
   */
  async productsAdd(
    _root: undefined,
    doc: IProduct,
    { models, subdomain, __, checkPermission }: IContext,
  ) {
    await checkPermission('productsCreate');

    const product = await models.Products.createProduct(__(doc));

    await refreshProductKnowledge({ subdomain, productIds: [product._id] });

    return product;
  },

  /**
   * Edits a product
   * @param {string} _id Product id
   * @param {Object} param2.doc Product info
   */
  async productsEdit(
    _parent: undefined,
    { _id, ...doc }: { _id: string } & IProduct,
    { models, subdomain, __, checkPermission }: IContext,
  ) {
    await checkPermission('productsUpdate');

    const product = await models.Products.updateProduct(
      _id,
      __({
        ...doc,
        status: 'active',
      }),
    );

    await refreshProductKnowledge({ subdomain, productIds: [_id] });

    return product;
  },

  /**
   * Removes a product
   * @param {string} param1._id Product id
   */
  async productsRemove(
    _parent: undefined,
    { productIds }: { productIds: string[] },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('productsDelete');

    const result = await models.Products.removeProducts(productIds);

    await refreshProductKnowledge({ subdomain, productIds });

    return result;
  },

  /**
   * Merge products
   */
  async productsMerge(
    _parent: undefined,
    {
      productIds,
      productFields,
    }: { productIds: string[]; productFields: IProduct },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('productsMerge');

    const product = await models.Products.mergeProducts(productIds, {
      ...productFields,
    });

    await refreshProductKnowledge({
      subdomain,
      productIds: [...productIds, product._id],
    });

    return product;
  },

  /**
   * Duplicate a product
   */
  async productsDuplicate(
    _parent: undefined,
    { _id }: { _id: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('productsCreate');

    const product = await models.Products.duplicateProduct(_id);

    await refreshProductKnowledge({ subdomain, productIds: [product._id] });

    return product;
  },
};
