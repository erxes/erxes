export const types = `
  type SurveyOption {
    _id: String!
    text: String!
    order: Int
    ticketCreationEnabled: Boolean
    ticketCreationThreshold: Int
    ticketPipelineId: String
    ticketStatusId: String
    ticketCreated: Boolean
    ticketId: String
  }

  type SurveyOptionResult {
    _id: String!
    text: String!
    count: Int!
    percent: Int!
  }

  type SurveyStep {
    _id: String!
    name: String
    description: String
    order: Int
    question: String!
    options: [SurveyOption!]!
    allowMultiselect: Boolean
  }

  type SurveyStepResult {
    _id: String!
    name: String
    question: String!
    totalVotes: Int!
    options: [SurveyOptionResult!]!
  }

  type SurveyResults {
    totalVotes: Int!
    voterCount: Int!
    options: [SurveyOptionResult!]!
    steps: [SurveyStepResult!]!
  }

  type Survey {
    _id: String!
    code: String
    title: String!
    question: String!
    channelId: String
    channel: Channel
    brandId: String
    options: [SurveyOption!]!
    steps: [SurveyStep!]!
    allowMultiselect: Boolean
    durationHours: Int
    status: String
    sentCount: Int
    createdUserId: String
    createdUser: User
    createdAt: Date
    updatedAt: Date
    results: SurveyResults
  }

  type SurveyListResponse {
    list: [Survey]
    pageInfo: PageInfo
    totalCount: Int
  }

  type SurveyTotalCount {
    total: Int
    byStatus: JSON
  }

  type SurveyVoteSelection {
    messageId: String!
    optionIds: [String!]!
  }

  type CpSurveyResponse {
    survey: Survey
    votedOptionIds: [String!]
  }

  type CpSurveyListResponse {
    list: [CpSurveyResponse!]
    pageInfo: PageInfo
    totalCount: Int
  }

  type SurveySubmitResponse {
    status: String!
    customerId: String
    conversationId: String
  }

  input SurveyOptionInput {
    _id: String
    text: String!
    order: Int
    ticketCreationEnabled: Boolean
    ticketCreationThreshold: Int
    ticketPipelineId: String
    ticketStatusId: String
  }

  input SurveyStepInput {
    _id: String
    name: String
    description: String
    order: Int
    question: String!
    options: [SurveyOptionInput!]!
    allowMultiselect: Boolean
  }
`;

const commonSurveyFields = `
  title: String!
  question: String
  channelId: String
  brandId: String
  options: [SurveyOptionInput!]
  steps: [SurveyStepInput!]
  allowMultiselect: Boolean
  durationHours: Int
  status: String
`;

const surveyCursorParams = `
  limit: Int
  cursor: String
  direction: CURSOR_DIRECTION
  cursorMode: CURSOR_MODE
  orderBy: JSON
`;

export const queries = `
  surveyList(searchValue: String, status: String, channelId: String, ${surveyCursorParams}): SurveyListResponse
  surveyDetail(_id: String!): Survey
  surveyTotalCount(searchValue: String, status: String, channelId: String): SurveyTotalCount
  cpSurveys(searchValue: String, channelId: String, brandId: String, ${surveyCursorParams}): CpSurveyListResponse
  cpSurveyDetail(channelId: String!, surveyCode: String!): CpSurveyResponse
  cpSurveyVotes(conversationId: String!): [SurveyVoteSelection!]
`;

export const mutations = `
  surveyAdd(${commonSurveyFields}): Survey
  surveyEdit(_id: String!, ${commonSurveyFields}): Survey
  surveyRemove(_ids: [String!]!): [String]
  surveyToggleStatus(_ids: [String!]!, status: String!): Boolean
  surveySendToConversation(_id: String!, conversationId: String!): ConversationMessage
  cpSurveySubmit(surveyCode: String!, optionIds: [String!]!): SurveySubmitResponse
`;
