import * as dotenv from "dotenv";

dotenv.config();

import { gql } from "apollo-server-express";

import plugins from "../plugins";

let pluginTypeDefs = '';

for (const plugin of plugins) {
  pluginTypeDefs = `${pluginTypeDefs} ${plugin.typeDefs}`
}

const typeDefs = gql`
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

export default typeDefs;