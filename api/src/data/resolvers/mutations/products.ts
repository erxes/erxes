import { ProductCategories, Products } from '../../../db/models';
import {
  IProduct,
  IProductCategory,
  IProductDocument
} from '../../../db/models/definitions/deals';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

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
    { user }: IContext
  ) {
    const product = await Products.getProduct({ _id });
    const updated = await Products.updateProduct(_id, doc);

    await putUpdateLog(
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
    { user }: IContext
  ) {
    const products: IProductDocument[] = await Products.find({
      _id: { $in: productIds }
    }).lean();

    const response = await Products.removeProducts(productIds);

    for (const product of products) {
      await putDeleteLog({ type: MODULE_NAMES.PRODUCT, object: product }, user);
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
    { user, docModifier }: IContext
  ) {
    const productCategory = await ProductCategories.createProductCategory(
      docModifier(doc)
    );

    await putCreateLog(
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
    { user }: IContext
  ) {
    const productCategory = await ProductCategories.getProductCatogery({ _id });
    const updated = await ProductCategories.updateProductCategory(_id, doc);

    await putUpdateLog(
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
    { user }: IContext
  ) {
    const productCategory = await ProductCategories.getProductCatogery({ _id });
    const removed = await ProductCategories.removeProductCategory(_id);

    await putDeleteLog(
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
    }: { productIds: string[]; productFields: IProduct }
  ) {
    return Products.mergeProducts(productIds, { ...productFields });
  },

  /**
   * Select feature of products
   */
  async productSelectFeature(
    _root,
    { _id, counter }: { _id: string; counter: string }
  ) {
    let product = await Products.getProduct({ _id });
    let attachment = null;

    if (product.attachmentMore && product.attachmentMore.length > 0) {
      attachment = product.attachmentMore[counter];
    }

    await Products.updateOne({ _id }, { $set: { attachment } });
    product = await Products.getProduct({ _id });

    return product;
  }
};

moduleCheckPermission(productMutations, 'manageProducts');

export default productMutations;
