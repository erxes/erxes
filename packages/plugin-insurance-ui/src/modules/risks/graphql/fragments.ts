import { gql } from '@apollo/client';

export const RISK_CORE_FIELDS = gql`
  fragment RiskCoreFields on Risk {
    _id
    name
    code
    description
    updatedAt
  }
`;

export const TEAM_MEMBER_FIELDS = gql`
  fragment TeamMemberFields on User {
    _id
    username
    email
    details {
      firstName
      fullName
      lastName
      shortName
      middleName
      avatar
    }
  }
`;
