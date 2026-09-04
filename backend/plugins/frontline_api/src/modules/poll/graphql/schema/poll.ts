export const types = `
  type PollOption {
    _id: String!
    text: String!
    order: Int
  }

  type PollOptionResult {
    _id: String!
    text: String!
    count: Int!
    percent: Int!
  }

  type PollResults {
    totalVotes: Int!
    voterCount: Int!
    options: [PollOptionResult!]!
  }

  type Poll {
    _id: String!
    code: String
    title: String!
    question: String!
    channelId: String
    channel: Channel
    options: [PollOption!]!
    allowMultiselect: Boolean
    durationHours: Int
    status: String
    sentCount: Int
    createdUserId: String
    createdUser: User
    createdAt: Date
    updatedAt: Date
    results: PollResults
  }

  type PollListResponse {
    list: [Poll]
    pageInfo: PageInfo
    totalCount: Int
  }

  type PollTotalCount {
    total: Int
    byStatus: JSON
  }

  type PollVoteSelection {
    messageId: String!
    optionIds: [String!]!
  }

  type PollConnectResponse {
    poll: Poll
    votedOptionIds: [String!]
  }

  type PollSubmitResponse {
    status: String!
    customerId: String
    conversationId: String
  }

  input PollOptionInput {
    _id: String
    text: String!
    order: Int
  }
`;

const commonPollFields = `
  title: String!
  question: String!
  channelId: String
  options: [PollOptionInput!]!
  allowMultiselect: Boolean
  durationHours: Int
  status: String
`;

const pollCursorParams = `
  limit: Int
  cursor: String
  direction: CURSOR_DIRECTION
  cursorMode: CURSOR_MODE
  orderBy: JSON
`;

export const queries = `
  pollList(searchValue: String, status: String, channelId: String, ${pollCursorParams}): PollListResponse
  pollDetail(_id: String!): Poll
  pollTotalCount(searchValue: String, status: String, channelId: String): PollTotalCount
  widgetsPollVotes(conversationId: String!, customerId: String, visitorId: String): [PollVoteSelection!]
`;

export const mutations = `
  pollAdd(${commonPollFields}): Poll
  pollEdit(_id: String!, ${commonPollFields}): Poll
  pollRemove(_ids: [String!]!): [String]
  pollToggleStatus(_ids: [String!]!, status: String!): Boolean
  pollSendToConversation(_id: String!, conversationId: String!): ConversationMessage
  widgetsPollVote(messageId: String!, optionIds: [String!]!, customerId: String, visitorId: String): ConversationMessage
  widgetsPollConnect(channelId: String!, pollCode: String!, cachedCustomerId: String): PollConnectResponse
  widgetsPollSubmit(pollCode: String!, optionIds: [String!]!, cachedCustomerId: String): PollSubmitResponse
`;
