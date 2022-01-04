import { gql } from "apollo-server-express";

const typeDefs = gql`
  type Subscription {
    conversationChanged(_id: String!): ConversationChangedResponse
    conversationMessageInserted(_id: String!): ConversationMessage
    conversationClientMessageInserted(userId: String!): ConversationMessage
    conversationClientTypingStatusChanged(_id: String!): ConversationClientTypingStatusChangedResponse
    conversationAdminMessageInserted(customerId: String): ConversationAdminMessageInsertedResponse
    conversationExternalIntegrationMessageInserted: JSON
    conversationBotTypingStatus(_id: String!): JSON
    customerConnectionChanged(_id: String): CustomerConnectionChangedResponse
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