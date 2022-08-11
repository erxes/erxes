import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

const CommentQueries: IObjectTypeResolver<any, IContext> = {
  forumComments: (_, params, { models: { Comment } }) => {
    const query: any = {};

    const { limit = 0, offset = 0, ...queryParams } = params;

    const fields = ['_id', 'postId', 'replyToId'];

    for (const field of fields) {
      const param = params[field];

      if (param) {
        query[field] = { $in: param };
      } else if (param === null) {
        query[field] = { $in: [param] };
      }
    }

    return Comment.find(query)
      .skip(offset)
      .limit(limit)
      .lean();
  },
  forumComment: (_, { _id }, { models: { Comment } }) => {
    return Comment.findById(_id).lean();
  }
};

export default CommentQueries;
