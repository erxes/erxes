import { gql } from '@apollo/client';

export const USER_ACTIVITY_SLOTS = gql`
  query userActivitySlots($_id: String!, $days: Int) {
    userActivitySlots(_id: $_id, days: $days) {
      enabled
      slotMinutes
      slots
    }
  }
`;

export const USER_ACTIVITY_RANKING = gql`
  query userActivityRanking($days: Int, $timeZone: String) {
    userActivityRanking(days: $days, timeZone: $timeZone) {
      enabled
      series {
        date
        activeMembers
        minutes
      }
      items {
        activeMinutes
        lastActiveAt
        user {
          _id
          email
          details {
            avatar
            fullName
            firstName
            lastName
          }
        }
      }
    }
  }
`;
