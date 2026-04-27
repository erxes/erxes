import { gql } from '@apollo/client';

export const PRODUCT_PLACES_RESPONDED = gql`
  subscription productPlacesResponded($userId: String, $sessionCode: String) {
    productPlacesResponded(userId: $userId, sessionCode: $sessionCode) {
      content
      responseId
      userId
      sessionCode
    }
  }
`;
