const ForumPollOption = `
type ForumPollOption  @cacheControl(maxAge: 30) {
    _id: ID!
    postId: ID!
    title: ID!

    createdByCpId: String
    createdByCp: ClientPortalUser

    createdById: String
    createdBy: User

    createdAt: Date

    votes: [ForumPollVote!]
}
`;

export default ForumPollOption;
