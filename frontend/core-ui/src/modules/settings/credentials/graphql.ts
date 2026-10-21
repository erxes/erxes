import { gql } from '@apollo/client';

const metadata = gql`
  fragment credentialsWorkspaceMetadata on CredentialMetadata {
    _id
    reference
    name
    description
    templateId
    category
    createdAt
    updatedAt
    fields {
      key
      label
      type
      secret
      required
      help
      hasValue
    }
  }
`;

export const CREDENTIALS_LIST = gql`
  query credentialsWorkspaceList($search: String, $category: String) {
    credentialsList(search: $search, category: $category) {
      ...credentialsWorkspaceMetadata
    }
    credentialsTemplates {
      id
      name
      category
      description
      fields {
        key
        label
        type
        secret
        required
        help
      }
    }
  }
  ${metadata}
`;

export const CREDENTIALS_CREATE = gql`
  mutation credentialsWorkspaceCreate($input: CredentialInput!) {
    credentialsCreate(input: $input) {
      ...credentialsWorkspaceMetadata
    }
  }
  ${metadata}
`;

export const CREDENTIALS_UPDATE = gql`
  mutation credentialsWorkspaceUpdate($_id: String!, $input: CredentialInput!) {
    credentialsUpdate(_id: $_id, input: $input) {
      ...credentialsWorkspaceMetadata
    }
  }
  ${metadata}
`;

export const CREDENTIALS_DELETE = gql`
  mutation credentialsWorkspaceDelete($_id: String!) {
    credentialsDelete(_id: $_id)
  }
`;

export const CREDENTIALS_GRANTS = gql`
  query credentialsWorkspaceGrants($credentialId: String!) {
    credentialsGrants(credentialId: $credentialId) {
      _id
      credentialId
      pluginName
      name
      createdAt
      revokedAt
    }
  }
`;

export const CREDENTIALS_GRANT_CREATE = gql`
  mutation credentialsWorkspaceGrantCreate(
    $credentialId: String!
    $pluginName: String!
    $name: String!
  ) {
    credentialsGrantCreate(
      credentialId: $credentialId
      pluginName: $pluginName
      name: $name
    ) {
      token
      grant {
        _id
        credentialId
        pluginName
        name
        createdAt
        revokedAt
      }
    }
  }
`;

export const CREDENTIALS_GRANT_REVOKE = gql`
  mutation credentialsWorkspaceGrantRevoke($_id: String!) {
    credentialsGrantRevoke(_id: $_id)
  }
`;
