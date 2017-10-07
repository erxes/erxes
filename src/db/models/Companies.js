import mongoose from 'mongoose';
import Random from 'meteor-random';

const CompanySchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },

  name: {
    type: String,
    optional: true,
  },

  size: {
    type: Number,
    optional: true,
  },

  industry: {
    type: String,
    optional: true,
  },

  website: {
    type: String,
    optional: true,
  },

  plan: {
    type: String,
    optional: true,
  },

  lastSeenAt: Date,
  sessionCount: Number,

  tagIds: {
    type: [String],
    optional: true,
  },
});

class Company {
  /**
   * Create a company
   * @param  {Object} companyObj object
   * @return {Promise} Newly created company object
   */
  static createCompany(doc) {
    return this.create(doc);
  }

  /*
   * Update company
   * @param {String} _id company id to update
   * @param {Object} doc field values to update
   * @return {Promise} updated company object
   */
  static async updateCompany(_id, doc) {
    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /*
   * Remove company
   * @param {String} _id company id to remove
   * @return {Promise}
   */
  static async removeCompany(_id) {
    const companyObj = await this.findOne({ _id });

    if (!companyObj) throw new Error(`Company not found with id ${_id}`);

    return companyObj.remove();
  }
}

CompanySchema.loadClass(Company);

const Companies = mongoose.model('companies', CompanySchema);

export default Companies;
