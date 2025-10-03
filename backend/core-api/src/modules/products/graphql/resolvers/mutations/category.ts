import { IProductCategory } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export const categoryMutations = {
  /**
   * Creates a new product category
   * @param {Object} doc Product category document
   */
  async productCategoriesAdd(
    _parent: undefined,
    doc: IProductCategory,
    { models }: IContext,
  ) {
    return await models.ProductCategories.createProductCategory(doc);
  },

  /**
   * Edits a product category
   * @param {string} param2._id ProductCategory id
   * @param {Object} param2.doc ProductCategory info
   */
  async productCategoriesEdit(
    _parent: undefined,
    { _id, ...doc }: { _id: string } & IProductCategory,
    { models }: IContext,
  ) {
    return await models.ProductCategories.updateProductCategory(_id, doc);
  },

  /**
   * Removes a product category
   * @param {string} param1._id ProductCategory id
   */

  async productCategoriesRemove(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return await models.ProductCategories.removeProductCategory(_id);
  },
};
