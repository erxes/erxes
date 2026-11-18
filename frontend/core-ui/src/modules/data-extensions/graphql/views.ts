import { gql } from '@apollo/client';

const VIEW_FIELDS = gql`
  fragment DataExtensionViewFields on DataExtensionView {
    _id
    recordType
    name
    type
    filter
    sortField
    sortDirection
    columns
    groupBy
    dateField
    shared
    createdBy
  }
`;

export const DATA_EXTENSION_VIEWS = gql`
  query DataExtensionViews($recordType: String!) {
    dataExtensionViews(recordType: $recordType) {
      ...DataExtensionViewFields
    }
  }
  ${VIEW_FIELDS}
`;

export const DATA_EXTENSION_VIEW_ADD = gql`
  mutation DataExtensionViewAdd($input: DataExtensionViewInput!) {
    dataExtensionViewAdd(input: $input) {
      ...DataExtensionViewFields
    }
  }
  ${VIEW_FIELDS}
`;

export const DATA_EXTENSION_VIEW_EDIT = gql`
  mutation DataExtensionViewEdit($_id: String!, $input: DataExtensionViewInput!) {
    dataExtensionViewEdit(_id: $_id, input: $input) {
      ...DataExtensionViewFields
    }
  }
  ${VIEW_FIELDS}
`;

export const DATA_EXTENSION_VIEW_DELETE = gql`
  mutation DataExtensionViewDelete($_id: String!) {
    dataExtensionViewDelete(_id: $_id)
  }
`;
