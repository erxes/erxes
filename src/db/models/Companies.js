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
    label: 'Name',
    optional: true,
  },

  size: {
    type: Number,
    label: 'Size',
    optional: true,
  },

  industry: {
    type: String,
    label: 'Industry',
    optional: true,
  },

  website: {
    type: String,
    label: 'Website',
    optional: true,
  },

  plan: {
    type: String,
    label: 'Plan',
    optional: true,
  },

  lastSeenAt: {
    type: Date,
    label: 'Last seen at',
  },

  sessionCount: {
    type: Number,
    label: 'Session count',
  },

  tagIds: {
    type: [String],
    optional: true,
  },

  customFieldsData: Object,
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
