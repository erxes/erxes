const Comment = {
  createdUser(comment, {}, { coreModels }) {
    return coreModels.Users.findOne({ _id: comment.createdBy });
  },

  async childCount(comment, {}, { models }) {
    const user = await models.Comments.find({
      parentId: comment._id
    }).countDocuments();
    return user;
  }
};

export default Comment;
