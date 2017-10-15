import mongoose from 'mongoose';
import Random from 'meteor-random';
import { Fields, Companies } from './';

/*
 * messenger schema
 */
const messengerSchema = mongoose.Schema(
  {
    lastSeenAt: {
      type: Date,
      label: 'Messenger: Last online',
    },
    sessionCount: {
      type: Number,
      label: 'Messenger: Session count',
    },
    isActive: {
      type: Boolean,
      label: 'Messenger: Is online',
    },
    customData: {
      type: Object,
      blackbox: true,
      optional: true,
    },
  },
  { _id: false },
);

/*
 * twitter schema
 */
const twitterSchema = mongoose.Schema(
  {
    id: {
      type: Number,
      label: 'Twitter: ID (Number)',
    },
    idStr: {
      type: String,
      label: 'Twitter: ID (String)',
    },
    name: {
      type: String,
      label: 'Twitter: Name',
    },
    screenName: {
      type: String,
      label: 'Twitter: Screen name',
    },
    profileImageUrl: {
      type: String,
      label: 'Twitter: Profile photo',
    },
  },
  { _id: false },
);

/*
 * facebook schema
 */
const facebookSchema = mongoose.Schema(
  {
    id: {
      type: String,
      label: 'Facebook: ID',
    },
    profilePic: {
      type: String,
      optional: true,
      label: 'Facebook: Profile photo',
    },
  },
  { _id: false },
);

const CustomerSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },

  name: { type: String, label: 'Name' },
  email: { type: String, label: 'Email' },
  phone: { type: String, label: 'Phone' },
  isUser: { type: Boolean, label: 'Is user' },
  createdAt: { type: Date, label: 'Created at' },

  integrationId: String,
  tagIds: [String],
  companyIds: [String],

  customFieldsData: Object,
  messengerData: messengerSchema,
  twitterData: twitterSchema,
  facebookData: facebookSchema,
});

class Customer {
  /**
   * Create a customer
   * @param  {Object} customerObj object
   * @return {Promise} Newly created customer object
   */
  static async createCustomer(doc) {
    const previousEntry = await this.findOne({ email: doc.email });

    // check duplication
    if (previousEntry) {
      throw new Error('Duplicated email');
    }

    // validate custom field values
    await Fields.validateMulti(doc.customFieldsData || {});

    return this.create(doc);
  }

  /*
   * Update customer
   * @param {String} _id customer id to update
   * @param {Object} doc field values to update
   * @return {Promise} updated customer object
   */
  static async updateCustomer(_id, doc) {
    const previousEntry = await this.findOne({
      _id: { $ne: _id },
      email: doc.email,
    });

    // check duplication
    if (previousEntry) {
      throw new Error('Duplicated email');
    }

    // validate custom field values
    await Fields.validateMulti(doc.customFieldsData || {});

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
    await this.findByIdAndUpdate(_id, { $addToSet: { companyIds: company._id } });

    return company;
  }
}

CustomerSchema.loadClass(Customer);

const Customers = mongoose.model('customers', CustomerSchema);

export default Customers;
