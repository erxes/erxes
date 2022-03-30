const Comment = {
  async createdUser(comment, {}, { models }) {
    const user = await models.Users.findOne({ _id: comment.createdBy });
    return user;
  },

  async childCount(comment, {}, { models }) {
    const user = await models.Comments.find({
      parentId: comment._id,
    }).countDocuments();
    return user;
  },
};

export default Comment;
