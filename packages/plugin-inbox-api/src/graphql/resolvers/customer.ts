import { IContext } from "../../connectionResolver";

export default {
  conversations(customer: { __typename: string; _id: string }, _args, { models }: IContext) {
    return models.Conversations.find({ customerId: customer._id }).lean();
  },
};
