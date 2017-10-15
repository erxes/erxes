import mongoose from 'mongoose';
import Random from 'meteor-random';

const BrandEmailConfigSchema = mongoose.Schema({
  type: {
    type: String,
    enum: ['simple', 'custom'],
  },
  template: String,
});

const BrandSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  code: String,
  name: String,
  description: String,
  userId: String,
  createdAt: Date,
  emailConfig: BrandEmailConfigSchema,
});

class Brand {
  /**
   * Create a brand
   * @param  {Object} doc object
   * @return {Promise} Newly created brand object
   */
  static createBrand(doc) {
    if (!doc.code) throw new Error('Code is required field');

    return this.create({
      ...doc,
      createdAt: new Date(),
    });
  }

  /**
   * Update a brand
   * @param  {string} _id - brand id
   * @param  {fields} fields - brand fields
   * @return {Promise} Updated brand object
   */
  static async updateBrand(_id, fields) {
    await Brands.update({ _id }, { $set: { ...fields } });
    return Brands.findOne({ _id });
  }

  /**
   * Delete brand
   * @param  {string} _id - brand id
   * @return {Promise} Updated brand object
   */
  static async removeBrand(_id) {
    const brandObj = await Brands.findOne({ _id });

    if (!brandObj) throw new Error(`Brand not found with id ${_id}`);

    return brandObj.remove();
  }

  /**
   * Update email config of brand
   * @param  {string} _id - brand id
   * @return {Promise} Updated brand object
   */
  static async updateEmailConfig(_id, emailConfig) {
    await Brands.update({ _id }, { $set: { emailConfig } });

    return Brands.findOne({ _id });
  }
}

BrandSchema.loadClass(Brand);

const Brands = mongoose.model('brands', BrandSchema);

export default Brands;
