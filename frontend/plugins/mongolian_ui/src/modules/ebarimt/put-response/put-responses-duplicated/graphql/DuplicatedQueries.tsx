import { gql } from '@apollo/client';

const putResponsesDuplicated = gql`
  query putResponsesDuplicated(
    $billType: String
    $startDate: Date
    $endDate: Date
    $page: Int
    $perPage: Int
  ) {
    putResponsesDuplicated(
      billType: $billType
      startDate: $startDate
      endDate: $endDate
      page: $page
      perPage: $perPage
    )
  }
`;

export const duplicatedQueries = {
  putResponsesDuplicated,
};
