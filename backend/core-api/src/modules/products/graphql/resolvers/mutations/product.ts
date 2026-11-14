import { IProduct } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import {
  resolveProductPdfAttachment,
  schedulePdfPagesRender,
} from '~/modules/products/utils/pdfAttachments';

export const productMutations = {
  /**
   * Creates a new product
   * @param {Object} doc Product document
   */
  async productsAdd(
    _root: undefined,
    doc: IProduct,
    { models, __, checkPermission, subdomain }: IContext,
  ) {
    await checkPermission('productsCreate');

    const { value, needsRender } = resolveProductPdfAttachment({
      pdfAttachment: doc.pdfAttachment,
    });

    const product = await models.Products.createProduct(
      __({ ...doc, pdfAttachment: value ?? undefined }),
    );

    if (needsRender && value?.pdf) {
      schedulePdfPagesRender({
        models,
        subdomain,
        productId: product._id,
        pdf: value.pdf,
      });
    }

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
    { models, __, checkPermission, subdomain }: IContext,
  ) {
    await checkPermission('productsUpdate');

    let needsRender = false;

    if (doc.pdfAttachment !== undefined) {
      const existing = await models.Products.findOne(
        { _id },
        { pdfAttachment: 1 },
      ).lean();

      const resolved = resolveProductPdfAttachment({
        pdfAttachment: doc.pdfAttachment,
        previousPdfAttachment: existing?.pdfAttachment,
      });

      doc.pdfAttachment = resolved.value ?? undefined;
      needsRender = resolved.needsRender;
    }

    const product = await models.Products.updateProduct(
      _id,
      __({
        ...doc,
        status: 'active',
      }),
    );

    if (needsRender && doc.pdfAttachment?.pdf) {
      schedulePdfPagesRender({
        models,
        subdomain,
        productId: _id,
        pdf: doc.pdfAttachment.pdf,
      });
    }

    return product;
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

    return models.Products.removeProducts(productIds);
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

    return models.Products.mergeProducts(productIds, {
      ...productFields,
    });
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

    return models.Products.duplicateProduct(_id);
  },
};
