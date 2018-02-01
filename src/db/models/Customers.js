import mongoose from 'mongoose';
import {
  Fields,
  Companies,
  ActivityLogs,
  Conversations,
  ConversationMessages,
  InternalNotes,
  EngageMessages,
} from './';
import { field } from './utils';

/* location schema */
const locationSchema = mongoose.Schema(
  {
    remoteAddress: String,
    country: String,
    city: String,
    region: String,
    hostname: String,
    language: String,
    userAgent: String,
  },
  { _id: false },
);

/*
 * messenger schema
 */
const messengerSchema = mongoose.Schema(
  {
    lastSeenAt: field({
      type: Date,
      label: 'Messenger: Last online',
    }),
    sessionCount: field({
      type: Number,
      label: 'Messenger: Session count',
    }),
    isActive: field({
      type: Boolean,
      label: 'Messenger: Is online',
    }),
    customData: field({
      type: Object,
      optional: true,
    }),
  },
  { _id: false },
);

/*
 * twitter schema
 */
const twitterSchema = mongoose.Schema(
  {
    id: field({
      type: Number,
      label: 'Twitter: ID (Number)',
    }),
    idStr: field({
      type: String,
      label: 'Twitter: ID (String)',
    }),
    name: field({
      type: String,
      label: 'Twitter: Name',
    }),
    screenName: field({
      type: String,
      label: 'Twitter: Screen name',
    }),
    profileImageUrl: field({
      type: String,
      label: 'Twitter: Profile photo',
    }),
  },
  { _id: false },
);

/*
 * facebook schema
 */
const facebookSchema = mongoose.Schema(
  {
    id: field({
      type: String,
      label: 'Facebook: ID',
    }),
    profilePic: field({
      type: String,
      optional: true,
      label: 'Facebook: Profile photo',
    }),
  },
  { _id: false },
);

const CustomerSchema = mongoose.Schema({
  _id: field({ pkey: true }),

  name: field({ type: String }),
  firstName: field({ type: String, label: 'First name' }),
  lastName: field({ type: String, label: 'Last name' }),
  email: field({ type: String, label: 'Email' }),
  phone: field({ type: String, label: 'Phone' }),
  isUser: field({ type: Boolean, label: 'Is user' }),
  createdAt: field({ type: Date, label: 'Created at' }),

  integrationId: field({ type: String }),
  tagIds: field({ type: [String] }),
  companyIds: field({ type: [String] }),

  location: field({ type: locationSchema }),

  customFieldsData: field({ type: Object }),
  messengerData: field({ type: messengerSchema }),
  twitterData: field({ type: twitterSchema }),
  facebookData: field({ type: facebookSchema }),
});

class Customer {
  /**
   * Create a customer
   * @param  {Object} customerObj object
   * @return {Promise} Newly created customer object
   */
  static async createCustomer(doc) {
    if (doc.email) {
      const previousEntry = await this.findOne({ email: doc.email });

      // check duplication
      if (previousEntry) {
        throw new Error('Duplicated email');
      }
    }

    // clean custom field values
    doc.customFieldsData = await Fields.cleanMulti(doc.customFieldsData || {});

    return this.create(doc);
  }

  /*
   * Update customer
   * @param {String} _id customer id to update
   * @param {Object} doc field values to update
   * @return {Promise} updated customer object
   */
  static async updateCustomer(_id, doc) {
    if (doc.email) {
      const previousEntry = await this.findOne({
        _id: { $ne: _id },
        email: doc.email,
      });

      // check duplication
      if (previousEntry) {
        throw new Error('Duplicated email');
      }
    }

    // clean custom field values
    doc.customFieldsData = await Fields.cleanMulti(doc.customFieldsData || {});

    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /**
   * Mark customer as inactive
   * @param  {String} _id
   * @return {Promise} Updated customer
   */
  static async markCustomerAsNotActive(_id) {
    await this.findByIdAndUpdate(
      _id,
      {
        $set: {
          'messengerData.isActive': false,
          'messengerData.lastSeenAt': new Date(),
        },
      },
      { new: true },
    );

    return this.findOne({ _id });
  }

  /*
   * Create new company and add to customer's company list
   * @param {String} name - Company name
   * @param {String} website - Company website
   * @return {Promise} newly created company
   */
  static async addCompany({ _id, name, website }) {
    // create company
    const company = await Companies.createCompany({ name, website });

    // add to companyIds list
    await this.findByIdAndUpdate(_id, {
      $addToSet: { companyIds: company._id },
    });

    return company;
  }

  /**
   * Update customer companies
   * @param {String} _id - Customer id to update
   * @param {string[]} companyIds - Company ids to update
   * @return {Promise} updated customer object
   */
  static async updateCompanies(_id, companyIds) {
    // updating companyIds field
    await this.findByIdAndUpdate(_id, { $set: { companyIds } });

    return this.findOne({ _id });
  }

  /**
   * Removes customer
   * @param {String} customerId - Customer id of customer to remove
   * @return {Promise} result
   */
  static async removeCustomer(customerId) {
    // Removing every modules that associated with customer
    await ActivityLogs.removeCustomerActivityLog(customerId);
    await ConversationMessages.removeCustomerConversationMessages(customerId);
    await Conversations.removeCustomerConversations(customerId);
    await EngageMessages.removeCustomerEngages(customerId);
    await InternalNotes.removeCustomerInternalNotes(customerId);

    return await this.remove({ _id: customerId });
  }

  /**
   * Merge customers
   * @param {string[]} customerIds - Customer ids to merge
   * @param {Object} customerFields - Customer infos to create with
   * @return {Promise} Customer object
   */
  static async mergeCustomers(customerIds, customerFields) {
    let tagIds = [];
    let companyIds = [];

    // Checking if customerFields has duplicated email
    if (customerFields.email) {
      const previousEntry = await this.findOne({
        _id: { $nin: customerIds },
        email: customerFields.email,
      });

      // check duplication
      if (previousEntry) {
        throw new Error('Duplicated email!');
      }
    }

    // Merging customer tags and companies
    for (let customerId of customerIds) {
      const customer = await this.findOne({ _id: customerId });
      const customerTags = customer.tagIds || [];
      const customerCompanies = customer.companyIds || [];

      // Merging customer's tag and companies into 1 array
      tagIds = tagIds.concat(customerTags);
      companyIds = companyIds.concat(customerCompanies);

      // Removing Customers
      await this.remove({ _id: customerId });
    }

    // Creating customer with properties
    const customer = await this.createCustomer({
      ...customerFields,
      tagIds,
      companyIds,
    });

    // Updating every modules associated with customers
    await ActivityLogs.changeCustomer(customer._id, customerIds);
    await ConversationMessages.changeCustomer(customer._id, customerIds);
    await Conversations.changeCustomer(customer._id, customerIds);
    await EngageMessages.changeCustomer(customer._id, customerIds);
    await EngageMessages.changeReceivedCustomer(customer._id, customerIds);
    await InternalNotes.changeCustomer(customer._id, customerIds);

    return customer;
  }
}

CustomerSchema.loadClass(Customer);

const Customers = mongoose.model('customers', CustomerSchema);

export default Customers;
