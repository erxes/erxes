import { gql } from '~/gql';

export const SAVE_CUSTOM_DOMAIN = gql(`
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
`);

export const REFRESH_CUSTOM_DOMAIN = gql(`
  mutation frontlineCustomDomainRefresh($helpCenterId: String!) {
    frontlineCustomDomainRefresh(helpCenterId: $helpCenterId) {
      ...CustomDomainFields
    }
  }
`);

export const RESET_CUSTOM_DOMAIN = gql(`
  mutation frontlineCustomDomainReset($helpCenterId: String!) {
    frontlineCustomDomainReset(helpCenterId: $helpCenterId) {
      ...CustomDomainFields
    }
  }
`);
