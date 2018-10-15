import { Customers, Users } from '../../db/models';
import { IMessageDocument } from '../../db/models/definitions/conversationMessages';

export default {
  user(message: IMessageDocument) {
    return Users.findOne({ _id: message.userId });
  },

  customer(message: IMessageDocument) {
    return Customers.findOne({ _id: message.customerId });
  },
};
