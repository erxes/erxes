import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

const mutationFilterParams = `
  channelId: String
  integrationId: String
  status: String
  unassigned: String
  tag: String
  integrationType: String
  participating: String
  mentioned: String
  unread: String
  awaitingResponse: String
  withSurvey: String
  withPoll: String
  automationStatus: String
  starred: String
  startDate: String
  endDate: String
  segment: String
  customerId: String
  brandId: String
  searchValue: String
`;

const convertParams = `
  _id: String!
  type: String!
  itemName: String
  stageId: String
  customFieldsData: JSON
  priority: String
  assignedUserIds: [String]
  labelIds: [String]
  tagIds: [String]
  branchIds: [String]
  departmentIds: [String]
  startDate: Date
  closeDate: Date
  attachments: [AttachmentInput]
  description: String
`;

export const cursorParams = `
  limit: Int
  cursor: String
  direction: CURSOR_DIRECTION
  cursorMode: CURSOR_MODE
  orderBy: JSON
`;

const filterParams = `
  ids: [String]
  ${cursorParams}
  ${mutationFilterParams}
`;

export const queries = `
  conversationMessage(_id: String!): ConversationMessage

  conversations(${filterParams}, skip: Int): ConversationListResponse
  conversationMessages(
    conversationId: String!
    skip: Int
    limit: Int
    getFirst: Boolean
  ): [ConversationMessage]

  conversationMessagesTotalCount(conversationId: String!): Int
  conversationPinnedMessages(conversationId: String!): [ConversationMessage]
  conversationCounts(${filterParams}, only: String): JSON
  conversationsTotalCount(${filterParams}): Int
  conversationDetail(_id: String!): Conversation
  conversationsGetLast(${filterParams}): Conversation
  conversationsTotalUnreadCount: Int
  userConversations(_id: String, ${GQL_CURSOR_PARAM_DEFS}, perPage: Int): UserConversationListResponse
  conversationConvertedItems(_id: String!): [ConversationConvertedItem]
`;

export const mutations = `
  conversationMessageReact(
    conversationId: String!
    messageId: String!
    reaction: String
    remove: Boolean
  ): Boolean!
  conversationMessageAdd(
    conversationId: String,
    responseTemplateId: String,
    content: String,
    mentionedUserIds: [String],
    internal: Boolean,
    attachments: [AttachmentInput],
    contentType: String
    extraInfo: JSON
    poll: ConversationPollInput
    replyToMessageId: String
  ): ConversationMessage
  conversationMessagePin(
    conversationId: String!
    messageId: String!
    remove: Boolean
  ): JSON
  conversationMessageEdit(
    _id: String!,
    content: String,
    mentionedUserIds: [String],
    internal: Boolean,
    attachments: [AttachmentInput],
    contentType: String
    extraInfo: JSON
  ): ConversationMessage
  conversationsAssign(conversationIds: [String]!, assignedUserId: String): [Conversation]
  conversationsUnassign(_ids: [String]!): [Conversation]
  conversationsChangeStatus(_ids: [String]!, status: String!): [Conversation]
  conversationMarkAsRead(_id: String): Conversation
  conversationAgentTyping(conversationId: String!, typing: Boolean): Boolean
  changeConversationOperator(_id: String!, operatorStatus: String!): JSON
  conversationSetAutomatedReplyControl(
    _id: String!
    status: String!
    reason: String
    pausedUntil: Date
  ): Conversation
  conversationsResolve(ids: [String!]!): Int
  conversationConvertToCard(${convertParams}): String
  conversationEditCustomFields(_id: String!, propertiesData: JSON, customFieldsData: JSON): Conversation
`;
