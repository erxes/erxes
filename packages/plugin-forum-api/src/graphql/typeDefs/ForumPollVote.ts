const ForumPollVote = `
type ForumPollVote  @cacheControl(maxAge: 30) {
    _id: ID!
    pollOptionId: ID!
    cpUserId: ID!

    cpUser: ClientPortalUser!
}
`;

export default ForumPollVote;
