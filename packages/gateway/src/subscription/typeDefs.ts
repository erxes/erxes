import * as dotenv from "dotenv";
dotenv.config();

import { gql } from "apollo-server-express";

const { SUBGRAPH_INBOX_URL } = process.env;

const inboxSubscriptions = `
  conversationChanged(_id: String!): ConversationChangedResponse
  conversationMessageInserted(_id: String!): ConversationMessage
  conversationClientMessageInserted(userId: String!): ConversationMessage
  conversationClientTypingStatusChanged(_id: String!): ConversationClientTypingStatusChangedResponse
  conversationAdminMessageInserted(customerId: String): ConversationAdminMessageInsertedResponse
  conversationExternalIntegrationMessageInserted: JSON
  conversationBotTypingStatus(_id: String!): JSON
  customerConnectionChanged(_id: String): CustomerConnectionChangedResponse
`

const typeDefs = gql`
  type Subscription {

    ${SUBGRAPH_INBOX_URL ? inboxSubscriptions : ""}

    activityLogsChanged: Boolean
    importHistoryChanged(_id: String!): ImportHistory
    notificationInserted(userId: String): Notification
    notificationRead(userId: String): JSON
    onboardingChanged(userId: String!): OnboardingNotification

    pipelinesChanged(_id: String!): PipelineChangeResponse
    userChanged(userId: String): JSON

    checklistsChanged(contentType: String!, contentTypeId: String!): Checklist
    checklistDetailChanged(_id: String!): Checklist
    calendarEventUpdated: JSON
  }
`;

export default typeDefs;