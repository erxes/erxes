import { gql } from '@apollo/client/core';
import { DocumentNode } from 'graphql';

// subscription fields the gateway resolves itself, outside any subgraph
export const gatewaySubscriptionTypeDefs = `
  activityLogsChanged: Boolean
  userChanged(userId: String): JSON
  segmentBuildChanged(segmentId: String!): JSON
`;

export default function getTypeDefs(plugins): DocumentNode {
  const pluginTypeDefs = (plugins || [])
    .map((plugin) => {
      const pluginModule = plugin.default || plugin;
      return pluginModule.typeDefs;
    })
    .join('\n\n');

  return gql`
    type Subscription {
      ${pluginTypeDefs}
      ${gatewaySubscriptionTypeDefs}
    }
  `;
}
