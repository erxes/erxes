import { gql } from 'apollo-server-express';
import { DocumentNode } from 'graphql';

export default function getTypeDefs(plugins: any[]): DocumentNode {
  const pluginTypeDefs = (plugins || [])
    .map(plugin => plugin.typeDefs)
    .join('\n\n');

  return gql`
    type Subscription {

      ${pluginTypeDefs}

      activityLogsChanged: Boolean
      importHistoryChanged(_id: String!): ImportHistory

      onboardingChanged(userId: String!): OnboardingNotification

      userChanged(userId: String): JSON

      checklistsChanged(contentType: String!, contentTypeId: String!): Checklist
      checklistDetailChanged(_id: String!): Checklist
      calendarEventUpdated: JSON
  }
`;
}
