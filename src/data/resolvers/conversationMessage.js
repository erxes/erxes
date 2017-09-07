import { Users, Customers } from '../../db/models';

export default {
  user(message) {
    return Users.findOne({ _id: message.userId });
  },

  customer(message) {
    return Customers.findOne({ _id: message.customerId });
  },
};
