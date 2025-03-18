const Comment = {
  async childCount(comment, {}, { models }) {
    return models.Comments.find({
      parentId: comment._id,
    }).countDocuments();
  },
};

export default Comment;
