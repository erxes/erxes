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
