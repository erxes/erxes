import { Products } from '../../../db/models';
import { IProduct } from '../../../db/models/definitions/deals';
import { moduleCheckPermission } from '../../permissions';

interface IProductsEdit extends IProduct {
  _id: string;
}

const productMutations = {
  /**
   * Create new product
   */
  productsAdd(_root, doc: IProduct) {
    return Products.createProduct(doc);
  },

  /**
   * Edit product
   */
  productsEdit(_root, { _id, ...doc }: IProductsEdit) {
    return Products.updateProduct(_id, doc);
  },

  /**
   * Remove product
   */
  productsRemove(_root, { _id }: { _id: string }) {
    return Products.removeProduct(_id);
  },
};

moduleCheckPermission(productMutations, 'manageProducts');

export default productMutations;
