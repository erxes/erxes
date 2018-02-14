import { Products } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const productMutations = {
  /**
  * Create new product
  * @param {String} doc.name
  * @param {String} doc.type
  * @param {String} doc.description
  * @param {String} doc.sku
  * @return {Promise} newly created product object
  */
  productsAdd(root, doc) {
    return Products.createProduct(doc);
  },

  /**
  * Edit product
  * @param {String} doc.name
  * @param {String} doc.type
  * @param {String} doc.description
  * @param {String} doc.sku
  * @return {Promise} updated product object
  */
  productsEdit(root, { _id, ...doc }) {
    return Products.updateProduct(_id, doc);
  },

  /**
  * Remove product
  * @param {String} _id
  * @return {Promise}
  */
  productsRemove(root, { _id }) {
    return Products.removeProduct(_id);
  },
};

moduleRequireLogin(productMutations);

export default productMutations;
