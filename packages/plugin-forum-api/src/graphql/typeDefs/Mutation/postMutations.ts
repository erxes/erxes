const postMutations = `
  forumCreatePost(categoryId: ID!, content: String!, thumbnail: String): ForumPost
`;

export default postMutations;
