const ForumSavedPost = `
type ForumSavedPost {
    _id: ID!
    postId: ID!
    cpUserId: ID!
    createdAt: Date!
    post: ForumPost
}

`;
export default ForumSavedPost;
