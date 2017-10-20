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
  /*
   * Generates new brand code
   * @param {String} code - initial code
   * @return {String} generatedCode - generated code
   */
  static async generateCode(code) {
    let generatedCode = code || Random.id().substr(0, 6);

    let prevBrand = await this.findOne({ code: generatedCode });

    // search until not existing one found
    while (prevBrand) {
      generatedCode = Random.id().substr(0, 6);

      if (code) {
        // eslint-disable-next-line no-console
        console.log('User defined brand code already exists. New code is generated.');
      }

      prevBrand = await this.findOne({ code: generatedCode });
    }

    return generatedCode;
  }

  /**
   * Create a brand
   * @param  {Object} doc object
   * @return {Promise} Newly created brand object
   */
  static async createBrand(doc) {
    // generate code automatically
    // if there is no brand code defined
    doc.code = await this.generateCode(doc.code);
    doc.createdAt = new Date();
    doc.emailConfig = { type: 'simple' };

    return this.create(doc);
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
