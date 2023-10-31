import { IConversationMessageDocument } from '../../models/ConversationMessages';
import { debug } from '../../configs';
import { IContext } from '../../models';

export default {
  user(message: IConversationMessageDocument, _args, { models }) {
    // const user = models.Accounts.findOne({ oa_id: '1837581770784032114' })
    // return {
    //   _id: user._id,
    //   username: user.name,
    //   details: {
    //     avatar: user.avatar,
    //     fullName: user.name
    //   }
    // }
    // return models.Accounts.find({}).lean()
    return message.userId && { __typename: 'User', _id: message.userId };
  },

  customer(message: IConversationMessageDocument) {
    return (
      message.customerId && { __typename: 'Customer', _id: message.customerId }
    );
  }
};
