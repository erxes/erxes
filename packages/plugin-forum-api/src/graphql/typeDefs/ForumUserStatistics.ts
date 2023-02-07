const ForumUserStatistics = `
type ForumUserStatistics @key(fields: "_id")  @cacheControl(maxAge: 60) {
    _id: ID!
    publishedPostCount: Int!  @cacheControl(maxAge: 60) 
    pendingPostCount: Int!  @cacheControl(maxAge: 60) 
    approvedPostCount: Int!  @cacheControl(maxAge: 60) 
    deniedPostCount: Int!  @cacheControl(maxAge: 60) 
    savedPostCount: Int!  @cacheControl(maxAge: 60) 
}
`;

export default ForumUserStatistics;
