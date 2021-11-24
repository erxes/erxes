const exmFeedCommentResolvers = [
  {
    type: 'ExmFeedComment',
    field: 'createdUser',
    handler: (comment, {}, { models }) => {
      return models.Users.findOne({ _id: comment.createdBy });
    }
  },
  {
    type: 'ExmFeedComment',
    field: 'childCount',
    handler: (comment, {}, { models }) => {
      return models.ExmFeedComments.find({
        parentId: comment._id
      }).countDocuments();
    }
  }
];

export default exmFeedCommentResolvers;
