const commentQueries = [
  {
    name: 'comments',
    handler: async (
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
    }
  },
  {
    name: 'commentCount',
    handler: async (
      _root,
      doc: { contentId: String; contentType: String },
      { models }
    ) => {
      return models.Comments.find(doc).countDocuments();
    }
  }
];

export default commentQueries;
