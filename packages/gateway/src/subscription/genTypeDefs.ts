import { gql } from "apollo-server-express";
import { DocumentNode } from "graphql";

export default function getTypeDefs(plugins: any[]): DocumentNode {
  const pluginTypeDefs = (plugins || [])
    .map((plugin) => plugin.typeDefs)
    .join("\n\n");

  return gql`

    # TODO: Move it into cards plugin
    type PipelineChangeResponse {
      _id: String
      proccessId: String
      action: String
      data: JSON
    }

    type Subscription {

      ${pluginTypeDefs}

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
}
