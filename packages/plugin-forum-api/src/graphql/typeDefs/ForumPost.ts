/*
export const postSchema = new Schema<PostDocument>({
  categoryId: { type: Types.ObjectId, index: true },
  content: { type: String, required: true },
  thumbnail: String
});
*/

export default `
  type ForumPost @key(fields: "_id") {
    _id: ID!
    content: String!
    thumbnail: String
    state: ForumPostState

    categoryId: ID!

    category: ForumCategory
  }
`;
