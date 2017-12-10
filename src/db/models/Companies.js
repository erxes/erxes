import mongoose from 'mongoose';
import { Fields, Customers } from './';
import { field } from './utils';

const CompanySchema = mongoose.Schema({
  _id: field({ pkey: true }),
  name: field({
    type: String,
    label: 'Name',
    unique: true,
  }),

  size: field({
    type: Number,
    label: 'Size',
    optional: true,
  }),

  industry: field({
    type: String,
    label: 'Industry',
    optional: true,
  }),

  website: field({
    type: String,
    label: 'Website',
    optional: true,
  }),

  plan: field({
    type: String,
    label: 'Plan',
    optional: true,
  }),

  lastSeenAt: field({
    type: Date,
    label: 'Last seen at',
  }),

  sessionCount: field({
    type: Number,
    label: 'Session count',
  }),

  tagIds: field({
    type: [String],
    optional: true,
  }),

  customFieldsData: field({
    type: Object,
  }),
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

  /**
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

  /**
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

  /**
     * Update company customers
     * @param {String} _id company id to update
     * @param {string[]} doc.customerIds customer ids to update
     * @return {Promise} updated company object
     */
  static async updateCustomers(_id, doc) {
    const { customerIds } = doc;

    await customerIds.forEach(customerId => {
      Customers.appendCompany({ _id: customerId, companyId: _id });
    });

    return this.findOne({ _id });
  }
}

CompanySchema.loadClass(Company);

const Companies = mongoose.model('companies', CompanySchema);

export default Companies;
