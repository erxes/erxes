import { IContext } from '../../connectionResolver';
import { ICommentConversation } from '../../models/definitions/comment_conversations';

export default {
  customer(comment: ICommentConversation, _args, { models }: IContext) {
    return models.Customers.findOne({ userId: comment.senderId });
  }
};
