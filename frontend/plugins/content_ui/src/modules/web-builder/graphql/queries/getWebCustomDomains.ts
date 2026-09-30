import { gql } from '@apollo/client';

export const WEB_CUSTOM_DOMAINS_FIELDS = gql`
  fragment WebCustomDomainsFields on WebCustomDomains {
    isDeployed
    defaultDomain
    domains {
      name
      verified
      misconfigured
      isActive
      records {
        type
        name
        value
        status
      }
    }
  }
`;

export const GET_WEB_CUSTOM_DOMAINS = gql`
  ${WEB_CUSTOM_DOMAINS_FIELDS}
  query WebCustomDomains($webId: String!) {
    webCustomDomains(webId: $webId) {
      ...WebCustomDomainsFields
    }
  }
`;
