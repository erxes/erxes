import { gql } from '@apollo/client';

export const PRODUCT_PLACES_RESPONDED = gql`
  subscription productPlacesResponded($userId: String, $sessionCode: String) {
    productPlacesResponded(userId: $userId, sessionCode: $sessionCode) {
      userId
      responseId
      sessionCode
      content
    }
  }
`;

export default { PRODUCT_PLACES_RESPONDED };
