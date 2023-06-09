import { gql } from '@apollo/client';
import { DocumentNode } from 'graphql';

export default function getTypeDefs(plugins: any[]): DocumentNode {
  const pluginTypeDefs = (plugins || [])
    .map(plugin => plugin.typeDefs)
    .join('\n\n');

  return gql`
    type Subscription {

      ${pluginTypeDefs}

      activityLogsChanged: Boolean

      onboardingChanged(userId: String!): OnboardingNotification

      userChanged(userId: String): JSON

      calendarEventUpdated: JSON
  }
`;
}
