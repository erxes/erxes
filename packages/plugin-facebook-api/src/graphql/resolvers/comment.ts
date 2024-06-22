import { IContext } from '../../connectionResolver';
import { ICommentConversationDocument } from '../../models/definitions/comment_conversations';

export default {
  async customer(comment: ICommentConversationDocument, _args, { models }: IContext) {
    return models.Customers.findOne({ userId: comment.senderId });
  },
};
