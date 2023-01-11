import { createPagedListType } from './utils';

const ForumSavedPost = `
type ForumSavedPost {
    _id: ID!
    postId: ID!
    cpUserId: ID!
    createdAt: Date
    post: ForumPost!
}

${createPagedListType('ForumSavedPost')}

`;
export default ForumSavedPost;
