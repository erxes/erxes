import { gql } from '@apollo/client';

export const ACTIVITY_LOGS_CHANGED = gql`
  subscription activityLogsChanged {
    activityLogsChanged
  }
`;
