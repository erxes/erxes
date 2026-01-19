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
  mutation FormsRemove($id: String!) {
    formsRemove(_id: $id)
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
    ) {
      _id
    }
  }
`;
