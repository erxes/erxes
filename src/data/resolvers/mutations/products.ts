import { Products } from '../../../db/models';
import { IProduct } from '../../../db/models/definitions/deals';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../utils';

interface IProductsEdit extends IProduct {
  _id: string;
}

const productMutations = {
  /**
   * Creates a new product
   * @param {Object} doc Product document
   */
  async productsAdd(_root, doc: IProduct, { user, docModifier }: IContext) {
    const product = await Products.createProduct(docModifier(doc));

    if (product) {
      await putCreateLog(
        {
          type: 'product',
          newData: JSON.stringify(doc),
          object: product,
          description: `${product.name} has been created`,
        },
        user,
      );
    }

    return product;
  },

  /**
   * Edits a product
   * @param {string} param2._id Product id
   * @param {Object} param2.doc Product info
   */
  async productsEdit(_root, { _id, ...doc }: IProductsEdit, { user, docModifier }: IContext) {
    const product = await Products.findOne({ _id });
    const updated = await Products.updateProduct(_id, docModifier(doc));

    if (product) {
      await putUpdateLog(
        {
          type: 'product',
          object: product,
          newData: JSON.stringify(doc),
          description: `${product.name} has been edited`,
        },
        user,
      );
    }

    return updated;
  },

  /**
   * Removes a product
   * @param {string} param1._id Product id
   */
  async productsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const product = await Products.findOne({ _id });
    const removed = await Products.removeProduct(_id);

    if (product) {
      await putDeleteLog(
        {
          type: 'product',
          object: product,
          description: `${product.name} has been removed`,
        },
        user,
      );
    }

    return removed;
  },
};

moduleCheckPermission(productMutations, 'manageProducts');

export default productMutations;
