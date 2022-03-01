import { Conversations } from "../../models";

export default {
  conversations(customer: { __typename: string; _id: string }) {
    return Conversations.find({ customerId: customer._id }).lean();
  },
};
