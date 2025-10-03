import { gql } from '@apollo/client/core';
import { DocumentNode } from 'graphql';

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
      activityLogsChanged: Boolean
      userChanged(userId: String): JSON
    }
  `;
}
