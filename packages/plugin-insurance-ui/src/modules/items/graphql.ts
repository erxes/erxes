import { gql } from '@apollo/client';

const customersQuery = gql`
  query customers(
    $mainType: String
    $mainTypeId: String
    $relType: String
    $isSaved: Boolean
  ) {
    customers(
      conformityMainType: $mainType
      conformityMainTypeId: $mainTypeId
      conformityRelType: $relType
      conformityIsSaved: $isSaved
    ) {
      _id
      firstName
      middleName
      lastName
      avatar
      primaryEmail
      primaryPhone
    }
  }
`;

export default {
  customersQuery,
};
