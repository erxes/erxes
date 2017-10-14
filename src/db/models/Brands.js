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
   * @param  {Object} brandObj object
   * @return {Promise} Newly created brand object
   */
  static createBrand(doc) {
    return this.create({
      ...doc,
      createdAt: new Date(),
    });
  }

  /**
   * Update a brand
   * @param  {_id} brandObj object
   * @param  {fields}
   * @return {Promise} Updated brand id
   */
  static updateBrand(_id, fields) {
    return this.update({ _id }, { $set: { ...fields } });
  }
}

BrandSchema.loadClass(Brand);

const Brands = mongoose.model('brands', BrandSchema);

export default Brands;
