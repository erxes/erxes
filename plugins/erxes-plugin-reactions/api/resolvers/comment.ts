const commentResolvers = [
  {
    type: 'Comment',
    field: 'createdUser',
    handler: (comment, {}, { models }) => {
      return models.Users.findOne({ _id: comment.createdBy });
    }
  },
  {
    type: 'Comment',
    field: 'childCount',
    handler: (comment, {}, { models }) => {
      return models.Comments.find({
        parentId: comment._id
      }).countDocuments();
    }
  }
];

export default commentResolvers;
