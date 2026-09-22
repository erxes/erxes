import { gql } from '@apollo/client';

export const AUTOMATION_STATS = gql`
  query AutomationStats(
    $automationId: String!
    $beginDate: Date
    $endDate: Date
  ) {
    automationStats(
      automationId: $automationId
      beginDate: $beginDate
      endDate: $endDate
    ) {
      total
      byStatus {
        key
        count
      }
      byErrorCode {
        key
        count
      }
      timeSeries {
        date
        total
        complete
        error
        waiting
      }
      nodes {
        actionId
        actionType
        total
        success
        error
        waiting
        avgDurationMs
        maxDurationMs
        errorCodes {
          key
          count
        }
      }
      errorMessages {
        message
        errorCode
        actionTypes
        count
        lastAt
      }
    }
  }
`;
