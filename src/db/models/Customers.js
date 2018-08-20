import * as mongoose from 'mongoose';
import {
  CUSTOMER_BASIC_INFOS,
  COC_LEAD_STATUS_TYPES,
  COC_LIFECYCLE_STATE_TYPES,
} from '../../data/constants';
import { Fields, Companies, ActivityLogs, Conversations, InternalNotes, EngageMessages } from './';
import { field } from './utils';
import Coc from './Coc';

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

const VisitorContactSchema = mongoose.Schema(
  {
    email: String,
    phone: String,
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
      label: 'Last seen at',
    }),
    sessionCount: field({
      type: Number,
      label: 'Session count',
    }),
    isActive: field({
      type: Boolean,
      label: 'Is online',
    }),
    customData: field({
      type: Object,
      optional: true,
    }),
  },
  { _id: false },
);

/*
 * Twitter schema
 * Saving fields with underscores because, we want to store it exactly
 * like twitter response so that we can use it in findParentTweets helper to
 * not send extra request to twitter
 */
const twitterSchema = mongoose.Schema(
  {
    id: field({ type: Number, label: 'Twitter ID (Number)' }),
    id_str: field({ type: String, label: 'Twitter ID' }),
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
      label: 'Facebook ID',
    }),
  },
  { _id: false },
);

const LinkSchema = mongoose.Schema(
  {
    linkedIn: field({ type: String, optional: true, label: 'LinkedIn' }),
    twitter: field({ type: String, optional: true, label: 'Twitter' }),
    facebook: field({ type: String, optional: true, label: 'Facebook' }),
    github: field({ type: String, optional: true, label: 'Github' }),
    youtube: field({ type: String, optional: true, label: 'Youtube' }),
    website: field({ type: String, optional: true, label: 'Website' }),
  },
  { _id: false },
);

const CustomerSchema = mongoose.Schema({
  _id: field({ pkey: true }),

  createdAt: field({ type: Date, label: 'Created at' }),
  modifiedAt: field({ type: Date, label: 'Modified at' }),
  avatar: field({ type: String, optional: true }),

  firstName: field({ type: String, label: 'First name', optional: true }),
  lastName: field({ type: String, label: 'Last name', optional: true }),
  // TODO: remove email field after customCommand
  email: field({ type: String, optional: true }),

  primaryEmail: field({ type: String, label: 'Primary Email', optional: true }),
  emails: field({ type: [String], optional: true }),
  // TODO: remove phone field after customCommand
  phone: field({ type: String, optional: true }),

  primaryPhone: field({ type: String, label: 'Primary Phone', optional: true }),
  phones: field({ type: [String], optional: true }),

  ownerId: field({ type: String, optional: true }),
  position: field({ type: String, optional: true, label: 'Position' }),
  department: field({ type: String, optional: true, label: 'Department' }),

  leadStatus: field({
    type: String,
    enum: COC_LEAD_STATUS_TYPES,
    optional: true,
    label: 'Lead Status',
  }),

  lifecycleState: field({
    type: String,
    enum: COC_LIFECYCLE_STATE_TYPES,
    optional: true,
    label: 'Lifecycle State',
  }),

  hasAuthority: field({ type: String, optional: true, label: 'Has authority' }),
  description: field({ type: String, optional: true, label: 'Description' }),
  doNotDisturb: field({
    type: String,
    optional: true,
    label: 'Do not disturb',
  }),
  links: field({ type: LinkSchema, default: {} }),

  isUser: field({ type: Boolean, label: 'Is user', optional: true }),

  integrationId: field({ type: String }),
  tagIds: field({ type: [String], optional: true }),
  companyIds: field({ type: [String], optional: true }),

  customFieldsData: field({ type: Object, optional: true }),
  messengerData: field({ type: messengerSchema, optional: true }),
  twitterData: field({ type: twitterSchema, optional: true }),
  facebookData: field({ type: facebookSchema, optional: true }),

  location: field({ type: locationSchema, optional: true }),

  // if customer is not a user then we will contact with this visitor using
  // this information
  visitorContactInfo: field({
    type: VisitorContactSchema,
    optional: true,
    label: 'Visitor contact info',
  }),
});

class Customer extends Coc {
  static getBasicInfos() {
    return CUSTOMER_BASIC_INFOS;
  }

  static getCocType() {
    return 'Customer';
  }

  getFullName() {
    return `${this.firstName || ''} ${this.lastName || ''}`;
  }

  /**
   * Checking if customer has duplicated unique properties
   * @param  {Object} customerFields - Customer fields to check duplications
   * @param  {String[]} idsToExclude - Customer ids to exclude
   * @return {Promise} - Result
   */
  static async checkDuplication(customerFields, idsToExclude) {
    const query = {};
    let previousEntry = null;

    // Adding exclude operator to the query
    if (idsToExclude) {
      if (idsToExclude instanceof Array) {
        query._id = { $nin: idsToExclude };
      } else {
        query._id = { $ne: idsToExclude };
      }
    }

    // Checking if customer has twitter data
    if (customerFields.twitterData) {
      previousEntry = await this.find({
        ...query,
        ['twitterData.id']: customerFields.twitterData.id,
      });

      if (previousEntry.length > 0) {
        throw new Error('Duplicated twitter');
      }
    }

    // Checking if customer has facebook data
    if (customerFields.facebookData) {
      previousEntry = await this.find({
        ...query,
        ['facebookData.id']: customerFields.facebookData.id,
      });

      if (previousEntry.length > 0) {
        throw new Error('Duplicated facebook');
      }
    }

    if (customerFields.primaryEmail) {
      // check duplication from primaryEmail
      previousEntry = await this.find({
        ...query,
        primaryEmail: customerFields.primaryEmail,
      });

      if (previousEntry.length > 0) {
        throw new Error('Duplicated email');
      }

      // check duplication from emails
      previousEntry = await this.find({
        ...query,
        emails: { $in: [customerFields.primaryEmail] },
      });

      if (previousEntry.length > 0) {
        throw new Error('Duplicated email');
      }
    }

    if (customerFields.primaryPhone) {
      // check duplication from primaryPhone
      previousEntry = await this.find({
        ...query,
        primaryPhone: customerFields.primaryPhone,
      });

      if (previousEntry.length > 0) {
        throw new Error('Duplicated phone');
      }

      // Check duplication from phones
      previousEntry = await this.find({
        ...query,
        phones: { $in: [customerFields.primaryPhone] },
      });

      if (previousEntry.length > 0) {
        throw new Error('Duplicated phone');
      }
    }
  }

  /**
   * Create a customer
   * @param  {Object} customerObj object
   * @return {Promise} Newly created customer object
   */
  static async createCustomer(doc) {
    // Checking duplicated fields of customer
    await this.checkDuplication(doc);

    // clean custom field values
    doc.customFieldsData = await Fields.cleanMulti(doc.customFieldsData || {});

    doc.createdAt = new Date();
    doc.modifiedAt = new Date();

    return this.create(doc);
  }

  /*
   * Update customer
   * @param {String} _id customer id to update
   * @param {Object} doc field values to update
   * @return {Promise} updated customer object
   */
  static async updateCustomer(_id, doc) {
    // Checking duplicated fields of customer
    await this.checkDuplication(doc, _id);

    if (doc.customFieldsData) {
      // clean custom field values
      doc.customFieldsData = await Fields.cleanMulti(doc.customFieldsData || {});
    }

    doc.modifiedAt = new Date();

    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /**
   * Mark customer as active
   * @param  {String} customerId
   * @return {Promise} Updated customer
   */
  static async markCustomerAsActive(customerId) {
    await this.update({ _id: customerId }, { $set: { 'messengerData.isActive': true } });

    return this.findOne({ _id: customerId });
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
   * @param {String[]} companyIds - Company ids to update
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
    await Conversations.removeCustomerConversations(customerId);
    await EngageMessages.removeCustomerEngages(customerId);
    await InternalNotes.removeCustomerInternalNotes(customerId);

    return Customers.remove({ _id: customerId });
  }

  /**
   * Merge customers
   * @param {String[]} customerIds - Customer ids to merge
   * @param {Object} customerFields - Customer infos to create with
   * @return {Promise} Customer object
   */
  static async mergeCustomers(customerIds, customerFields) {
    // Checking duplicated fields of customer
    await this.checkDuplication(customerFields, customerIds);

    let tagIds = [];
    let companyIds = [];

    let emails = [];
    let phones = [];

    if (customerFields.primaryEmail) {
      emails.push(customerFields.primaryEmail);
    }

    if (customerFields.primaryPhone) {
      phones.push(customerFields.primaryPhone);
    }

    // Merging customer tags and companies
    for (let customerId of customerIds) {
      const customer = await this.findOne({ _id: customerId });

      if (customer) {
        // get last customer's integrationId
        customerFields.integrationId = customer.integrationId;

        const customerTags = customer.tagIds || [];
        const customerCompanies = customer.companyIds || [];

        // Merging customer's tag and companies into 1 array
        tagIds = tagIds.concat(customerTags);
        companyIds = companyIds.concat(customerCompanies);

        // Merging emails, phones
        emails = [...emails, ...(customer.emails || [])];
        phones = [...phones, ...(customer.phones || [])];

        // Removing Customers
        await this.remove({ _id: customerId });
      }
    }

    // Removing Duplicated Tags from customer
    tagIds = Array.from(new Set(tagIds));

    // Removing Duplicated Companies from customer
    companyIds = Array.from(new Set(companyIds));

    // Removing Duplicated Emails from customer
    emails = Array.from(new Set(emails));

    // Removing Duplicated Phones from customer
    phones = Array.from(new Set(phones));

    // Creating customer with properties
    const customer = await this.createCustomer({
      ...customerFields,
      tagIds,
      companyIds,
      emails,
      phones,
    });

    // Updating every modules associated with customers
    await ActivityLogs.changeCustomer(customer._id, customerIds);
    await Conversations.changeCustomer(customer._id, customerIds);
    await EngageMessages.changeCustomer(customer._id, customerIds);
    await InternalNotes.changeCustomer(customer._id, customerIds);

    return customer;
  }
}

CustomerSchema.loadClass(Customer);

const Customers = mongoose.model('customers', CustomerSchema);

export default Customers;
