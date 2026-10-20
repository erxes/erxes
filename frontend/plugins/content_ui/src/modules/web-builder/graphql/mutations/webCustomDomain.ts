import { gql } from '~/gql';

export const ADD_WEB_CUSTOM_DOMAIN = gql(`
  mutation WebCustomDomainAdd($webId: String!, $hostname: String!) {
    webCustomDomainAdd(webId: $webId, hostname: $hostname) {
      ...WebCustomDomainsFields
    }
  }
`);

export const REFRESH_WEB_CUSTOM_DOMAIN = gql(`
  mutation WebCustomDomainRefresh($webId: String!, $hostname: String!) {
    webCustomDomainRefresh(webId: $webId, hostname: $hostname) {
      ...WebCustomDomainsFields
    }
  }
`);

export const REMOVE_WEB_CUSTOM_DOMAIN = gql(`
  mutation WebCustomDomainRemove($webId: String!, $hostname: String!) {
    webCustomDomainRemove(webId: $webId, hostname: $hostname) {
      ...WebCustomDomainsFields
    }
  }
`);
