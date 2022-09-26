import { requireLogin } from '@erxes/api-utils/src/permissions';

const commentQueries = {
  comments: async (
    _root,
    { limit, skip, contentId, contentType, parentId },
    { models }
  ) => {
    const filter: any = {
      contentId,
      contentType
    };

    if (parentId) {
      filter.parentId = parentId;
    } else {
      filter.$or = [
        { parentId: { $exists: false } },
        { parentId: { $eq: null } }
      ];
    }

    return {
      list: await models.Comments.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip || 0)
        .limit(limit || 20),
      totalCount: await models.Comments.find(filter).countDocuments()
    };
  },

  commentCount: async (
    _root,
    doc: { contentId: String; contentType: String },
    { models }
  ) => {
    return models.Comments.find(doc).countDocuments();
  }
};

requireLogin(commentQueries, 'comments');
requireLogin(commentQueries, 'commentCount');

export default commentQueries;
