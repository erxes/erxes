import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';

import {
  IProduct,
  IProductCategory,
  IProductDocument
} from '../../../models/definitions/products';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';

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
  async productsAdd(
    _root,
    doc: IProduct,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const product = await models.Products.createProduct(docModifier(doc));

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PRODUCT,
        newData: {
          ...doc,
          categoryId: product.categoryId,
          customFieldsData: product.customFieldsData
        },
        object: product
      },
      user
    );

    return product;
  },

  /**
   * Edits a product
   * @param {string} param2._id Product id
   * @param {Object} param2.doc Product info
   */
  async productsEdit(
    _root,
    { _id, ...doc }: IProductsEdit,
    { user, models, subdomain }: IContext
  ) {
    const product = await models.Products.getProduct({ _id });
    const updated = await models.Products.updateProduct(_id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PRODUCT,
        object: product,
        newData: { ...doc, customFieldsData: updated.customFieldsData },
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Removes a product
   * @param {string} param1._id Product id
   */
  async productsRemove(
    _root,
    { productIds }: { productIds: string[] },
    { user, models, subdomain }: IContext
  ) {
    const products: IProductDocument[] = await models.Products.find({
      _id: { $in: productIds }
    }).lean();

    const response = await models.Products.removeProducts(productIds);

    for (const product of products) {
      await putDeleteLog(
        models,
        subdomain,
        { type: MODULE_NAMES.PRODUCT, object: product },
        user
      );
    }

    return response;
  },

  /**
   * Creates a new product category
   * @param {Object} doc Product category document
   */
  async productCategoriesAdd(
    _root,
    doc: IProductCategory,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const productCategory = await models.ProductCategories.createProductCategory(
      docModifier(doc)
    );

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PRODUCT_CATEGORY,
        newData: { ...doc, order: productCategory.order },
        object: productCategory
      },
      user
    );

    return productCategory;
  },

  /**
   * Edits a product category
   * @param {string} param2._id ProductCategory id
   * @param {Object} param2.doc ProductCategory info
   */
  async productCategoriesEdit(
    _root,
    { _id, ...doc }: IProductCategoriesEdit,
    { user, models, subdomain }: IContext
  ) {
    const productCategory = await models.ProductCategories.getProductCatogery({
      _id
    });
    const updated = await models.ProductCategories.updateProductCategory(
      _id,
      doc
    );

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.PRODUCT_CATEGORY,
        object: productCategory,
        newData: doc,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Removes a product category
   * @param {string} param1._id ProductCategory id
   */
  async productCategoriesRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const productCategory = await models.ProductCategories.getProductCatogery({
      _id
    });
    const removed = await models.ProductCategories.removeProductCategory(_id);

    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.PRODUCT_CATEGORY, object: productCategory },
      user
    );

    return removed;
  },

  /**
   * Merge products
   */
  async productsMerge(
    _root,
    {
      productIds,
      productFields
    }: { productIds: string[]; productFields: IProduct },
    { models }: IContext
  ) {
    return models.Products.mergeProducts(productIds, { ...productFields });
  }
};

moduleCheckPermission(productMutations, 'manageProducts');

export default productMutations;
