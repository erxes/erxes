const ForumPage = `
type ForumPage {
    _id: ID!
    code: String
    content: String
    description: String
    title: String
    thumbnail: String
    listOrder: Float
  
    custom: JSON
    customIndexed: JSON
}
`;

export default ForumPage;
