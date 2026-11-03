import { gql } from '@apollo/client';

export const USER_SESSIONS = gql`
  query userSessions($_id: String!) {
    userSessions(_id: $_id) {
      _id
      method
      createdAt
      lastSeenAt
      expiresAt
      userAgent
      current
    }
  }
`;

export const USERS_REVOKE_SESSIONS = gql`
  mutation usersRevokeSessions($_id: String!, $sessionId: String) {
    usersRevokeSessions(_id: $_id, sessionId: $sessionId)
  }
`;
