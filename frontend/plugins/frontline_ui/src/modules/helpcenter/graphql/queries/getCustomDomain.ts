import { gql } from '@apollo/client';

export const CUSTOM_DOMAIN_FIELDS = gql`
  fragment CustomDomainFields on FrontlineCustomDomain {
    isAvailable
    cnameTarget
    hostname
    status
    sslStatus
    dnsStatus
    isActive
    verificationErrors
    lastCheckedAt
    records {
      type
      name
      value
      status
    }
  }
`;

export const GET_CUSTOM_DOMAIN = gql`
  ${CUSTOM_DOMAIN_FIELDS}
  query frontlineCustomDomain {
    frontlineCustomDomain {
      ...CustomDomainFields
    }
  }
`;
