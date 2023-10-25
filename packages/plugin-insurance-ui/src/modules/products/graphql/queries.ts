import { gql } from '@apollo/client';
import { TEAM_MEMBER_FIELDS, PRODUCT_CORE_FIELDS } from './fragments';

const PRODUCTS_PAGINATED = gql`
  ${TEAM_MEMBER_FIELDS}
  ${PRODUCT_CORE_FIELDS}
  query InsuranceProductsPaginated(
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: SortDirection
    $searchValue: String
  ) {
    insuranceProductsPaginated(
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
      searchValue: $searchValue
    ) {
      count
      products {
        ...ProductCoreFields
        lastModifiedBy {
          ...TeamMemberFields
        }
      }
    }
  }
`;

export default {
  PRODUCTS_PAGINATED
};
