import { gql } from '@apollo/client';
import { WEB_CUSTOM_DOMAINS_FIELDS } from '../queries/getWebCustomDomains';

export const ADD_WEB_CUSTOM_DOMAIN = gql`
  ${WEB_CUSTOM_DOMAINS_FIELDS}
  mutation WebCustomDomainAdd($webId: String!, $hostname: String!) {
    webCustomDomainAdd(webId: $webId, hostname: $hostname) {
      ...WebCustomDomainsFields
    }
  }
`;

export const REFRESH_WEB_CUSTOM_DOMAIN = gql`
  ${WEB_CUSTOM_DOMAINS_FIELDS}
  mutation WebCustomDomainRefresh($webId: String!, $hostname: String!) {
    webCustomDomainRefresh(webId: $webId, hostname: $hostname) {
      ...WebCustomDomainsFields
    }
  }
`;

export const REMOVE_WEB_CUSTOM_DOMAIN = gql`
  ${WEB_CUSTOM_DOMAINS_FIELDS}
  mutation WebCustomDomainRemove($webId: String!, $hostname: String!) {
    webCustomDomainRemove(webId: $webId, hostname: $hostname) {
      ...WebCustomDomainsFields
    }
  }
`;
