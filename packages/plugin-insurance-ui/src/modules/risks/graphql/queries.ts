import { gql } from '@apollo/client';
import { RISK_CORE_FIELDS, TEAM_MEMBER_FIELDS } from './fragments';

const RISKS_PAGINATED = gql`
  ${RISK_CORE_FIELDS}
  ${TEAM_MEMBER_FIELDS}
  query RisksPaginated(
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: SortDirection
    $searchValue: String
  ) {
    risksPaginated(
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
      searchValue: $searchValue
    ) {
      count
      risks {
        ...RiskCoreFields
        lastModifiedBy {
          ...TeamMemberFields
        }
      }
    }
  }
`;

const RISKS = gql`
  query Risks($searchValue: String) {
    risks(searchValue: $searchValue) {
      _id
      code
      name
    }
  }
`;

export default {
  RISKS_PAGINATED,
  RISKS
};
