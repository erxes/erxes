import mongoose from 'mongoose';
import Random from 'meteor-random';
import { Fields, Customers } from './';

const CompanySchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },

  name: {
    type: String,
    label: 'Name',
    unique: true,
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
  static async createCompany(doc) {
    const previousEntry = await this.findOne({ name: doc.name });

    // check duplication
    if (previousEntry) {
      throw new Error('Duplicated name');
    }

    // clean custom field values
    doc.customFieldsData = await Fields.cleanMulti(doc.customFieldsData || {});

    return this.create(doc);
  }

  /*
   * Update company
   * @param {String} _id company id to update
   * @param {Object} doc field values to update
   * @return {Promise} updated company object
   */
  static async updateCompany(_id, doc) {
    const previousEntry = await this.findOne({
      _id: { $ne: _id },
      name: doc.name,
    });

    // check duplication
    if (previousEntry) {
      throw new Error('Duplicated name');
    }

    // clean custom field values
    doc.customFieldsData = await Fields.cleanMulti(doc.customFieldsData || {});

    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /*
   * Create new customer and add to customer's customer list
   * @return {Promise} newly created customer
   */
  static async addCustomer({ _id, name, email }) {
    // create customer
    return await Customers.createCustomer({
      name,
      email,
      companyIds: [_id],
    });
  }
}

CompanySchema.loadClass(Company);

const Companies = mongoose.model('companies', CompanySchema);

export default Companies;
