const typeDefinitions = `
  scalar Date

  type Conversation {
    _id: String!
    content: String
  }

  type Message {
    _id: String!
    conversationId: String!
    content: String
    createdAt: Date
  }

  # the schema allows the following two queries:
  type RootQuery {
    conversations: [Conversation]
    messages(conversationId: String): [Message]
  }

  # we need to tell the server which types represent the root query
  # and root mutation types. We call them RootQuery and RootMutation by convention.
  schema {
    query: RootQuery
  }
`;

export default [typeDefinitions];
