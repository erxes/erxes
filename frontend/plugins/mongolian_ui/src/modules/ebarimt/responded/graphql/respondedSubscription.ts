import { gql } from '@apollo/client';

export const EBARIMT_RESPONDED = gql`
  subscription ebarimtResponded($userId: String, $sessionCode: String) {
    ebarimtResponded(userId: $userId, sessionCode: $sessionCode) {
      content
      responseId
      userId
      sessionCode
    }
  }
`;

export default { EBARIMT_RESPONDED };
