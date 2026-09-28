import { gql } from '@apollo/client';
import { CUSTOM_DOMAIN_FIELDS } from '@/customdomain/graphql/queries';

export const SAVE_CUSTOM_DOMAIN = gql`
  ${CUSTOM_DOMAIN_FIELDS}
  mutation frontlineCustomDomainSave($hostname: String!) {
    frontlineCustomDomainSave(hostname: $hostname) {
      ...CustomDomainFields
    }
  }
`;

export const REFRESH_CUSTOM_DOMAIN = gql`
  ${CUSTOM_DOMAIN_FIELDS}
  mutation frontlineCustomDomainRefresh {
    frontlineCustomDomainRefresh {
      ...CustomDomainFields
    }
  }
`;

export const RESET_CUSTOM_DOMAIN = gql`
  ${CUSTOM_DOMAIN_FIELDS}
  mutation frontlineCustomDomainReset {
    frontlineCustomDomainReset {
      ...CustomDomainFields
    }
  }
`;
