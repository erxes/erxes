const postMutations = `
  forumCreatePost(categoryId: ID!, content: String!, title: String! state: ForumPostState thumbnail: String): ForumPost!
  forumPatchPost(_id: ID!, categoryId: ID, content: String, title: String, thumbnail: String, state: ForumPostState): ForumPost!
  forumDeletePost(_id: ID!): ForumPost!
`;

export default postMutations;
