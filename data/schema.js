const typeDefinitions = `
  type Conversation {
    _id: String!
    content: String
  }

  # the schema allows the following two queries:
  type RootQuery {
    conversations: [Conversation]
  }

  # we need to tell the server which types represent the root query
  # and root mutation types. We call them RootQuery and RootMutation by convention.
  schema {
    query: RootQuery
  }
`;

export default [typeDefinitions];
