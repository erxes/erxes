import { IProduct } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export const productMutations = {
  /**
   * Creates a new product
   * @param {Object} doc Product document
   */
  async productsAdd(
    _root: undefined,
    doc: IProduct,
    { models, __, checkPermission }: IContext,
  ) {
    await checkPermission('productsCreate');

    return await models.Products.createProduct(__(doc));
  },

  /**
   * Edits a product
   * @param {string} _id Product id
   * @param {Object} param2.doc Product info
   */
  async productsEdit(
    _parent: undefined,
    { _id, ...doc }: { _id: string } & IProduct,
    { models, __, checkPermission }: IContext,
  ) {
    await checkPermission('productsUpdate');

    return await models.Products.updateProduct(
      _id,
      __({
        ...doc,
        status: 'active',
      }),
    );
  },

  /**
   * Removes a product
   * @param {string} param1._id Product id
   */
  async productsRemove(
    _parent: undefined,
    { productIds }: { productIds: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsDelete');

    return await models.Products.removeProducts(productIds);
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
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsMerge');

    return models.Products.mergeProducts(productIds, { ...productFields });
  },

  /**
   * Duplicate a product
   */
  async productsDuplicate(
    _parent: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsCreate');

    return await models.Products.duplicateProduct(_id);
  },
};
