import mongoose from 'mongoose';
import Random from 'meteor-random';

const CustomerSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },

  name: String,
  email: String,
  phone: String,
  isUser: Boolean,

  integrationId: String,
  createdAt: Date,

  internalNotes: Object,
  tagIds: [String],

  messengerData: Object,
  twitterData: Object,
  facebookData: Object,
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
