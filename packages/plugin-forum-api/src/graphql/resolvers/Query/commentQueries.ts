import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';

const buildCommentsQuery = queryParams => {
  const query: any = {};

  const fields = ['_id', 'postId', 'replyToId'];

  for (const field of fields) {
    const param = queryParams[field];

    if (param) {
      query[field] = { $in: param };
    } else if (param === null) {
      query[field] = { $in: [param] };
    }
  }

  return query;
};

const CommentQueries: IObjectTypeResolver<any, IContext> = {
  forumComments: (_, params, { models: { Comment } }) => {
    const { limit = 0, offset = 0, sort = {}, ...queryParams } = params;
    const query: any = buildCommentsQuery(queryParams);

    return Comment.find(query)
      .sort(sort)
      .skip(offset)
      .limit(limit)
      .lean();
  },

  forumCommentsCount: (_, params, { models: { Comment } }) => {
    const { limit = 0, offset = 0, sort = {}, ...queryParams } = params;
    const query: any = buildCommentsQuery(queryParams);

    return Comment.countDocuments(query);
  },
  forumComment: (_, { _id }, { models: { Comment } }) => {
    return Comment.findById(_id).lean();
  }
};

export default CommentQueries;
