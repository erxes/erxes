import * as mongoose from 'mongoose';
import { PRODUCT_TYPES } from '../../data/constants';
import { Deals } from '.';
import { field } from './utils';

const ProductSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  type: field({
    type: String,
    enum: PRODUCT_TYPES.ALL,
    default: PRODUCT_TYPES.PRODUCT,
  }),
  description: field({ type: String, optional: true }),
  sku: field({ type: String, optional: true }), // Stock Keeping Unit
  createdAt: field({
    type: Date,
    default: new Date(),
  }),
});

class Product {
  /**
   * Create a product
   * @param  {Object} doc
   * @return {Promise} Newly created product object
   */
  static async createProduct(doc) {
    return this.create(doc);
  }

  /**
   * Update Product
   * @param  {Object} doc
   * @return {Promise} updated product object
   */
  static async updateProduct(_id, doc) {
    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /**
   * Remove Product
   * @param  {String} _id
   * @return {Promise}
   */
  static async removeProduct(_id) {
    const product = await Products.findOne({ _id });

    if (!product) throw new Error('Product not found');

    const count = await Deals.find({
      'productsData.productId': { $in: [_id] },
    }).count();

    if (count > 0) throw new Error("Can't remove a product");

    return Products.remove({ _id });
  }
}

ProductSchema.loadClass(Product);
const Products = mongoose.model('products', ProductSchema);

export default Products;
