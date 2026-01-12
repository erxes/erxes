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

export const FORMS_FIELD_ADD = gql`
  mutation FrontlineFieldsAdd(
    $contentType: String!
    $contentTypeId: String
    $type: String
    $validation: String
    $text: String
    $description: String
    $options: [String]
    $isRequired: Boolean
    $order: Int
    $groupId: String
    $objectListConfigs: [FrontlineObjectListConfigInput]
  ) {
    frontlineFieldsAdd(
      contentType: $contentType
      contentTypeId: $contentTypeId
      type: $type
      validation: $validation
      text: $text
      description: $description
      options: $options
      isRequired: $isRequired
      order: $order
      groupId: $groupId
      objectListConfigs: $objectListConfigs
    ) {
      _id
    }
  }
`;

export const FORM_BULK_ADD = gql`
  mutation FrontlineFieldsBulkAction(
    $contentType: String!
    $contentTypeId: String
    $newFields: [FrontlineFieldItem]
  ) {
    frontlineFieldsBulkAction(
      contentType: $contentType
      contentTypeId: $contentTypeId
      newFields: $newFields
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
