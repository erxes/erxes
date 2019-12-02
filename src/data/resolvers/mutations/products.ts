import { ProductCategories, Products } from '../../../db/models';
import { IProduct, IProductCategory } from '../../../db/models/definitions/deals';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../utils';

interface IProductsEdit extends IProduct {
  _id: string;
}

interface IProductCategoriesEdit extends IProductCategory {
  _id: string;
}

const productMutations = {
  /**
   * Creates a new product
   * @param {Object} doc Product document
   */
  async productsAdd(_root, doc: IProduct, { user, docModifier }: IContext) {
    const product = await Products.createProduct(docModifier(doc));

    await putCreateLog(
      {
        type: 'product',
        newData: JSON.stringify(doc),
        object: product,
        description: `${product.name} has been created`,
      },
      user,
    );

    return product;
  },

  /**
   * Edits a product
   * @param {string} param2._id Product id
   * @param {Object} param2.doc Product info
   */
  async productsEdit(_root, { _id, ...doc }: IProductsEdit, { user }: IContext) {
    const product = await Products.getProduct({ _id });
    const updated = await Products.updateProduct(_id, doc);

    await putUpdateLog(
      {
        type: 'product',
        object: product,
        newData: JSON.stringify(doc),
        description: `${product.name} has been edited`,
      },
      user,
    );

    return updated;
  },

  /**
   * Removes a product
   * @param {string} param1._id Product id
   */
  async productsRemove(_root, { productIds }: { productIds: string[] }, { user }: IContext) {
    const products = await Products.find({ _id: { $in: productIds } }, { name: 1 }).lean();

    await Products.removeProducts(productIds);

    for (const product of products) {
      await putDeleteLog(
        {
          type: 'product',
          object: product,
          description: `${product.name} has been removed`,
        },
        user,
      );
    }

    return productIds;
  },

  /**
   * Creates a new product category
   * @param {Object} doc Product category document
   */

  async productCategoriesAdd(_root, doc: IProductCategory, { user, docModifier }: IContext) {
    const productCategory = await ProductCategories.createProductCategory(docModifier(doc));

    await putCreateLog(
      {
        type: 'product-category',
        newData: JSON.stringify(doc),
        object: productCategory,
        description: `${productCategory.name} has been created`,
      },
      user,
    );

    return productCategory;
  },

  /**
   * Edits a product category
   * @param {string} param2._id ProductCategory id
   * @param {Object} param2.doc ProductCategory info
   */
  async productCategoriesEdit(_root, { _id, ...doc }: IProductCategoriesEdit, { user }: IContext) {
    const productCategory = await ProductCategories.getProductCatogery({ _id });

    const updated = await ProductCategories.updateProductCategory(_id, doc);

    await putUpdateLog(
      {
        type: 'product-category',
        object: productCategory,
        newData: JSON.stringify(doc),
        description: `${productCategory.name} has been edited`,
      },
      user,
    );

    return updated;
  },

  /**
   * Removes a product category
   * @param {string} param1._id ProductCategory id
   */
  async productCategoriesRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const productCategory = await ProductCategories.getProductCatogery({ _id });
    const removed = await ProductCategories.removeProductCategory(_id);

    await putDeleteLog(
      {
        type: 'product-category',
        object: productCategory,
        description: `${productCategory.name} has been removed`,
      },
      user,
    );

    return removed;
  },
};

moduleCheckPermission(productMutations, 'manageProducts');

export default productMutations;
