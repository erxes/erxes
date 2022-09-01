const postMutations = `
  forumCreatePost(categoryId: ID!, content: String!, title: String!, state: ForumPostState, thumbnail: String): ForumPost!
  forumPatchPost(_id: ID!, categoryId: ID, content: String, title: String, thumbnail: String, state: ForumPostState): ForumPost!
  forumDeletePost(_id: ID!): ForumPost!
  forumPostDraft(_id: ID!): ForumPost!
  forumPostPublish(_id: ID!): ForumPost!

  forumCreatePostCp(categoryId: ID!, content: String!, title: String!, state: ForumPostState, thumbnail: String): ForumPost!
  forumPatchPostCp(_id: ID!, categoryId: ID, content: String, title: String, thumbnail: String, state: ForumPostState): ForumPost!
  forumDeletePostCp(_id: ID!): ForumPost!
  forumPostDraftCp(_id: ID!): ForumPost!
  forumPostPublishCp(_id: ID!): ForumPost!
`;

export default postMutations;
