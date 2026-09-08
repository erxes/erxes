import { gql } from '@apollo/client';

export const HRM_SENIORITY_RULES = gql`
  query hrmSeniorityRules(
    $status: String
    $searchValue: String
    $page: Int
    $perPage: Int
  ) {
    hrmSeniorityRules(
      status: $status
      searchValue: $searchValue
      page: $page
      perPage: $perPage
    ) {
      _id
      code
      name
      description
      valueType
      brackets {
        minMonths
        maxMonths
        value
      }
      status
    }
  }
`;

export const HRM_SENIORITY_RULES_COUNT = gql`
  query hrmSeniorityRulesCount($status: String, $searchValue: String) {
    hrmSeniorityRulesCount(status: $status, searchValue: $searchValue)
  }
`;
