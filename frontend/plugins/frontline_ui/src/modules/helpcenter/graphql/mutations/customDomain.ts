import { gql } from '@apollo/client';
import { CUSTOM_DOMAIN_FIELDS } from '@/helpcenter/graphql/queries/getCustomDomain';

export const SAVE_CUSTOM_DOMAIN = gql`
  ${CUSTOM_DOMAIN_FIELDS}
  mutation frontlineCustomDomainSave(
    $helpCenterId: String!
    $hostname: String!
  ) {
    frontlineCustomDomainSave(
      helpCenterId: $helpCenterId
      hostname: $hostname
    ) {
      ...CustomDomainFields
    }
  }
`;

export const REFRESH_CUSTOM_DOMAIN = gql`
  ${CUSTOM_DOMAIN_FIELDS}
  mutation frontlineCustomDomainRefresh($helpCenterId: String!) {
    frontlineCustomDomainRefresh(helpCenterId: $helpCenterId) {
      ...CustomDomainFields
    }
  }
`;

export const RESET_CUSTOM_DOMAIN = gql`
  ${CUSTOM_DOMAIN_FIELDS}
  mutation frontlineCustomDomainReset($helpCenterId: String!) {
    frontlineCustomDomainReset(helpCenterId: $helpCenterId) {
      ...CustomDomainFields
    }
  }
`;
