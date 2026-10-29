import { gql } from '@apollo/client';

export const LDAP_CONFIG_SAVE = gql`
  mutation AuthLdapConfigSave($input: AuthLdapConfigInput!) {
    authLdapConfigSave(input: $input) {
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
      updatedAt
    }
  }
`;

export const LDAP_TEST_CONNECTION = gql`
  mutation AuthLdapTestConnection(
    $input: AuthLdapConfigInput!
    $identifier: String
  ) {
    authLdapTestConnection(input: $input, identifier: $identifier) {
      ok
      message
      profile {
        dn
        username
        email
        firstName
        lastName
        groupDns
      }
    }
  }
`;

export const LDAP_LINK_USER = gql`
  mutation AuthLdapLinkUser($userId: String!, $identifier: String!) {
    authLdapLinkUser(userId: $userId, identifier: $identifier)
  }
`;

export const LDAP_UNLINK_USER = gql`
  mutation AuthLdapUnlinkUser($userId: String!) {
    authLdapUnlinkUser(userId: $userId)
  }
`;
