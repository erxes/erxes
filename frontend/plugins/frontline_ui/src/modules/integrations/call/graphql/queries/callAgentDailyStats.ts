import { gql } from '@apollo/client';

export const CALL_AGENT_DAILY_STATS = gql`
  query CallAgentDailyStats(
    $integrationId: String!
    $queue: String!
    $startDate: String
    $endDate: String
  ) {
    callAgentDailyStats(
      integrationId: $integrationId
      queue: $queue
      startDate: $startDate
      endDate: $endDate
    ) {
      date
      extension
      firstName
      lastName
      status
      answer
      abandon
      talktime
      pauseReason
      currentPauseStartedAt
      totalPausedSec
      pauseIntervals {
        start
        end
        durationSec
      }
    }
  }
`;
