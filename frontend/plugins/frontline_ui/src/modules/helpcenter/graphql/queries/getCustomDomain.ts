import { gql } from '~/gql';

export const CUSTOM_DOMAIN_FIELDS = gql(`
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
`);

export const GET_CUSTOM_DOMAIN = gql(`
  query frontlineCustomDomain($helpCenterId: String!) {
    frontlineCustomDomain(helpCenterId: $helpCenterId) {
      ...CustomDomainFields
    }
  }
`);
