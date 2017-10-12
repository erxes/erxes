import mongoose from 'mongoose';
import Random from 'meteor-random';

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

/*
 * internal note schema
 */
const internalNoteSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  content: {
    type: String,
  },
  createdBy: {
    type: String,
  },
  createdDate: {
    type: Date,
  },
});

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
  internalNotes: [internalNoteSchema],
  messengerData: messengerSchema,
  twitterData: twitterSchema,
  facebookData: facebookSchema,
});

class Customer {
  /*
   * Update customer
   * @param {String} _id customer id to update
   * @param {Object} doc field values to update
   * @return {Promise} updated customer object
   */
  static async updateCustomer(_id, doc) {
    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /**
   * Mark customer as inactive
   * @param  {String} customerId
   * @return {Promise} Updated customer
   */
  static markCustomerAsNotActive(customerId) {
    return this.findByIdAndUpdate(
      customerId,
      {
        $set: {
          'messengerData.isActive': false,
          'messengerData.lastSeenAt': new Date(),
        },
      },
      { new: true },
    );
  }
}

CustomerSchema.loadClass(Customer);

const Customers = mongoose.model('customers', CustomerSchema);

export default Customers;
