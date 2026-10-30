import { gql } from '@apollo/client';

export const LDAP_CONFIG = gql`
  query AuthLdapConfig {
    authLdapConfig {
      enabled
      serverType
      url
      startTls
      bindDn
      hasBindPassword
      baseDn
      loginAttribute
      userFilter
      allowedGroupDns
      linkEmailDomains
      groupMappings {
        groupDn
        permissionGroupIds
      }
      recheckEveryMinutes
      groupChangePolicy
      lastRecheck {
        at
        status
        error
        checked
      }
      nextRecheckAt
      recheckChanges {
        userId
        reason
        signedOut
        at
      }
      updatedAt
    }
  }
`;

export const LDAP_LINKED_USER_IDS = gql`
  query AuthLdapLinkedUserIds {
    authLdapLinkedUserIds
  }
`;
