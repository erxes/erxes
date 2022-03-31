const Comment = {
  createdUser(comment, {}, { coreModels }) {
    return coreModels.Users.findOne({ _id: comment.createdBy });
  },

  childCount(comment, {}, { models }) {
    return models.Comments.find({
      parentId: comment._id
    }).countDocuments();
  }
};

export default Comment;
