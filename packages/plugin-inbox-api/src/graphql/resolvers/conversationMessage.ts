import { IMessageDocument } from "../../models/definitions/conversationMessages";
import { IContext } from '@erxes/api-utils'
import { Customers, Users } from "../../apiCollections";

export default {
  user(message: IMessageDocument) {
    return Users.findOne({ _id: message.userId });
  },

  customer(message: IMessageDocument, _, { dataLoaders }: IContext) { 
    return Customers.findOne({ _id: message.customerId });
  },
};
