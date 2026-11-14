import { gql } from '@apollo/client';

export const MEMBER_AVAILABILITY_FIELDS = `
  availability {
    status
    source
    until
    reason
    declaredStatus
    declaredUntil
    declaredReason
  }
`;

export const USERS_SET_AVAILABILITY = gql`
  mutation UsersSetAvailability(
    $_id: String!
    $status: String
    $until: Date
    $reason: String
  ) {
    usersSetAvailability(
      _id: $_id
      status: $status
      until: $until
      reason: $reason
    ) {
      _id
      ${MEMBER_AVAILABILITY_FIELDS}
    }
  }
`;

export const TEAM_AVAILABILITY_SETTINGS = gql`
  query TeamAvailabilitySettings {
    teamAvailabilitySettings {
      segmentId
      precedence
    }
  }
`;

export const TEAM_AVAILABILITY_SETTINGS_UPDATE = gql`
  mutation TeamAvailabilitySettingsUpdate(
    $segmentId: String
    $precedence: String
  ) {
    teamAvailabilitySettingsUpdate(
      segmentId: $segmentId
      precedence: $precedence
    ) {
      segmentId
      precedence
    }
  }
`;
