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

input ForumPollOptionInput {
    """ If _id is set, the poll option with the given _id will be updated. Otherwise, a new poll option will be created. """
    _id: String
    title: String!
}
`;

export default ForumPollOption;
