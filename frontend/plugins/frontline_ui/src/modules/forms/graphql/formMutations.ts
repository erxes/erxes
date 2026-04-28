import { gql } from '@apollo/client';

export const FORMS_ADD = gql`
  mutation FormsAdd(
    $name: String!
    $type: String!
    $title: String
    $channelId: String
    $description: String
    $buttonText: String
    $numberOfPages: Int
    $leadData: JSON
    $integrationId: String
  ) {
    formsAdd(
      name: $name
      type: $type
      title: $title
      channelId: $channelId
      description: $description
      buttonText: $buttonText
      numberOfPages: $numberOfPages
      leadData: $leadData
      integrationId: $integrationId
    ) {
      _id
    }
  }
`;

export const FORM_BULK_ACTION = gql`
  mutation FrontlineFieldsBulkAction(
    $contentType: String!
    $contentTypeId: String
    $newFields: [FrontlineFieldItem]
    $updatedFields: [FrontlineFieldItem]
  ) {
    frontlineFieldsBulkAction(
      contentType: $contentType
      contentTypeId: $contentTypeId
      newFields: $newFields
      updatedFields: $updatedFields
    ) {
      _id
    }
  }
`;

export const FORM_REMOVE = gql`
  mutation FormsRemove($_ids: [String]) {
    formsRemove(_ids: $_ids)
  }
`;

export const FORM_EDIT = gql`
  mutation FormsEdit(
    $id: String!
    $name: String!
    $type: String!
    $title: String
    $channelId: String
    $description: String
    $buttonText: String
    $numberOfPages: Int
    $leadData: JSON
    $integrationId: String
  ) {
    formsEdit(
      _id: $id
      name: $name
      type: $type
      title: $title
      channelId: $channelId
      description: $description
      buttonText: $buttonText
      numberOfPages: $numberOfPages
      leadData: $leadData
      integrationId: $integrationId
    ) {
      _id
    }
  }
`;

export const FORM_TOGGLE_STATUS = gql`
  mutation FormsToggleStatus($ids: [String]!, $status: String) {
    formsToggleStatus(_ids: $ids, status: $status)
  }
`;

export const CRAETE_LEAD_INTEGRATION = gql`
  mutation IntegrationsCreateLeadIntegration(
    $name: String!
    $channelId: String
  ) {
    integrationsCreateLeadIntegration(name: $name, channelId: $channelId) {
      _id
    }
  }
`;
