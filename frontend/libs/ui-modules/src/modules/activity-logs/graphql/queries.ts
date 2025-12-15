import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_PAGE_INFO,
  GQL_CURSOR_PARAMS,
} from 'erxes-ui';

export const ACTIVITY_LOGS = gql`
  query activityLogs(
    $targetType: String!
    $targetId: String!
    $action: String
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    activityLogs(
      targetType: $targetType
      targetId: $targetId
      action: $action
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        _id
        createdAt
        actorType
        actor
        targetType
        target
        action
        context
        contextType
        changes
        activityType
        metadata
      }
      totalCount
      ${GQL_PAGE_INFO}
    }
  }
`;
