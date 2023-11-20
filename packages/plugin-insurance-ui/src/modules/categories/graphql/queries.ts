import { gql } from '@apollo/client';
import { TEAM_MEMBER_FIELDS } from '../../risks/graphql/fragments';

const CATEGORY_LIST = gql`
  ${TEAM_MEMBER_FIELDS}
  query InsuranceCategoryList(
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: SortDirection
    $searchValue: String
  ) {
    insuranceCategoryList(
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
      searchValue: $searchValue
    ) {
      list {
        _id
        name
        code
        description
        lastModifiedBy {
          ...TeamMemberFields
        }
        lastModifiedAt
        riskIds
        risks {
          _id
          name
          code
        }
      }
      totalCount
    }
  }
`;

const GET_CATEGORIES = gql`
  query InsuranceCategories($searchValue: String, $page: Int, $perPage: Int) {
    insuranceCategories(
      searchValue: $searchValue
      page: $page
      perPage: $perPage
    ) {
      _id
      name

      risks {
        _id
        name
      }
    }
  }
`;

export default {
  CATEGORY_LIST,
  GET_CATEGORIES
};
