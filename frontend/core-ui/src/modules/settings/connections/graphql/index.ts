import { gql } from '@apollo/client';

const CONNECTION_FIELDS = gql`
  fragment ConnectionFields on Connection {
    _id
    name
    icon
    logo
    type
    typeLabel
    typeAvailable
    hasTest
    status
    fields {
      key
      label
      secret
      value
      hasValue
    }
    lastTestedAt
    lastTestStatus
    lastTestMessage
    createdAt
    updatedAt
  }
`;

export const CONNECTIONS = gql`
  ${CONNECTION_FIELDS}
  query connections($searchValue: String, $type: String) {
    connections(searchValue: $searchValue, type: $type) {
      ...ConnectionFields
    }
  }
`;

export const CONNECTIONS_TYPES = gql`
  query connectionsTypes {
    connectionsTypes {
      id
      pluginName
      label
      description
      icon
      allowCustomFields
      hasTest
      fields {
        key
        label
        description
        placeholder
        required
        secret
        inputType
        pattern
        minLength
        maxLength
      }
    }
  }
`;

export const CONNECTIONS_ADD = gql`
  ${CONNECTION_FIELDS}
  mutation connectionsAdd($input: ConnectionAddInput!) {
    connectionsAdd(input: $input) {
      ...ConnectionFields
    }
  }
`;

export const CONNECTIONS_EDIT = gql`
  ${CONNECTION_FIELDS}
  mutation connectionsEdit($_id: String!, $input: ConnectionEditInput!) {
    connectionsEdit(_id: $_id, input: $input) {
      ...ConnectionFields
    }
  }
`;

export const CONNECTIONS_REMOVE = gql`
  mutation connectionsRemove($_id: String!) {
    connectionsRemove(_id: $_id)
  }
`;

export const CONNECTIONS_TEST = gql`
  ${CONNECTION_FIELDS}
  mutation connectionsTest($_id: String!) {
    connectionsTest(_id: $_id) {
      ok
      message
      connection {
        ...ConnectionFields
      }
    }
  }
`;
