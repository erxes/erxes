import { Conversations, Integrations } from "../../models";
import { client as msgBroker } from "../../messageBroker";

export default {
  async integration(customerRef: { __typename: string; _id: string }) {
    const customer: any = await msgBroker.sendRPCMessage(
      "contacts:Customers.findOne",
      { selector: { _id: customerRef._id }, fields: { integrationId: 1 } }
    );
    return Integrations.findOne({ _id: customer.integrationId });
  },

  conversations(customerRef: { __typename: string; _id: string }) {
    return Conversations.find({ customerId: customerRef._id }).lean();
  },
};
