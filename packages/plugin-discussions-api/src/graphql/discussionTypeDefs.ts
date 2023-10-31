export const types = `
  type Discussion {
    _id: String!

    createdAt: Date
    createdUserId: String

    title: String
    content: String
    attachments: [JSON]
    tags: [String]
    questions: [String]
  }

  type DiscussionVote {
    _id: String!

    createdAt: Date
    createdUserId: String

    discussionId: String
    isUp: Boolean
  }
`;

const params = `
  limit: Int,
  page: Int,
  perPage: Int,
`;

export const queries = `
  discussions(${params}): [Discussion]
  discussionsDetail(_id: String!): Discussion
`;

export const mutations = `
  discussionsSave(_id: String, title: String!, content: String!, attachments: [JSON], tags: [String], questions: [String]): Discussion
  discussionsRemove(_id: String!): JSON
  discussionsVote(discussionId: String!, isUp: Boolean): DiscussionVote
`;
