import { gql } from '@apollo/client';

const fields = `
  _id
  code
  name
  description
  employeeRate
  employerRate
  status
`;

export const HRM_CONTRIBUTION_PROFILES_CREATE = gql`
  mutation hrmContributionProfilesCreate($doc: HrmContributionProfileInput!) {
    hrmContributionProfilesCreate(doc: $doc) {
      ${fields}
    }
  }
`;

export const HRM_CONTRIBUTION_PROFILES_UPDATE = gql`
  mutation hrmContributionProfilesUpdate(
    $_id: String!
    $doc: HrmContributionProfileInput!
  ) {
    hrmContributionProfilesUpdate(_id: $_id, doc: $doc) {
      ${fields}
    }
  }
`;

export const HRM_CONTRIBUTION_PROFILES_ARCHIVE = gql`
  mutation hrmContributionProfilesArchive($_id: String!) {
    hrmContributionProfilesArchive(_id: $_id) {
      ${fields}
    }
  }
`;
