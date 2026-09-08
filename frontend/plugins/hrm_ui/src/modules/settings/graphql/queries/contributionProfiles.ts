import { gql } from '@apollo/client';

export const HRM_CONTRIBUTION_PROFILES = gql`
  query hrmContributionProfiles(
    $status: String
    $searchValue: String
    $page: Int
    $perPage: Int
  ) {
    hrmContributionProfiles(
      status: $status
      searchValue: $searchValue
      page: $page
      perPage: $perPage
    ) {
      _id
      code
      name
      description
      employeeRate
      employerRate
      status
    }
  }
`;

export const HRM_CONTRIBUTION_PROFILES_COUNT = gql`
  query hrmContributionProfilesCount($status: String, $searchValue: String) {
    hrmContributionProfilesCount(status: $status, searchValue: $searchValue)
  }
`;
