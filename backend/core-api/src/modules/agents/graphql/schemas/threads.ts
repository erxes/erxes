/**
 * GraphQL schema for the agents conversation threads.
 *
 * Thin wrappers over the same `MastraMemory` calls the former REST routes
 * served, so the agents sidebar can live in the Apollo cache (the
 * platform's reactive store) and refresh through the
 * `agentsThreadsChanged` subscription instead of manual refreshes.
 */

export const types = `
  type AgentsThread {
    id: String
    title: String
    pinned: Boolean
    createdAt: Date
    updatedAt: Date
  }

  type AgentsThreadList {
    threads: [AgentsThread]
    total: Int
    page: Int
    perPage: Int
    hasMore: Boolean
  }

  type AgentsMessage {
    id: String
    role: String
    createdAt: Date
    content: JSON
  }

  type AgentsThreadDetail {
    thread: AgentsThread
    messages: [AgentsMessage]
  }

  """
  Payload of the \`agentsThreadsChanged\` subscription. The server filters
  events to the acting user, so the payload only ever carries the subscriber's
  own user id and serves purely as a refetch signal.
  """
  type AgentsThreadsChanged {
    userId: String
  }
`;

export const queries = `
  agentsThreads(page: Int, perPage: Int, pinned: Boolean): AgentsThreadList
  agentsThreadDetail(threadId: String!): AgentsThreadDetail
`;

export const mutations = `
  agentsThreadUpdate(
    threadId: String!
    title: String
    pinned: Boolean
  ): AgentsThread
  agentsThreadRemove(threadId: String!): Boolean
`;
