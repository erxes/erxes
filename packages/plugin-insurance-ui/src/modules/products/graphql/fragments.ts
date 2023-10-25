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

export const PRODUCT_CORE_FIELDS = gql`
  fragment ProductCoreFields on InsuranceProduct {
    _id
    name
    code
    price
    description
    updatedAt
    riskIds
    companyProductConfigs {
      companyId
      specificPrice
    }
    risks {
      _id
      name
      code
      description
      updatedAt
    }
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
