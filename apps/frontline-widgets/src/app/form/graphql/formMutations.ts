import { gql } from '@apollo/client';

export const FORM_WIDGET_CONNECT = gql`
  mutation WidgetsLeadConnect(
    $channelId: String!
    $formCode: String!
    $cachedCustomerId: String
  ) {
    widgetsLeadConnect(
      channelId: $channelId
      formCode: $formCode
      cachedCustomerId: $cachedCustomerId
    ) {
      form {
        _id
        name
        title
        code
        type
        description
        buttonText
        createdDate
        numberOfPages
        status
        googleMapApiKey
        fields {
          _id
          code
          column
          content
          contentType
          contentTypeId
          description
          field
          isDisabled
          isRequired
          isVisible
          name
          options
          objectListConfigs {
            key
            type
            label
          }
          order
          pageNumber
          text
          type
        }
        visibility
        leadData
        languageCode
        departmentIds
        tagIds
        channelId
        integrationId
      }
    }
  }
`;

export const FORM_WIDGET_SAVE_LEAD = gql`
  mutation widgetsSaveLead(
    $formId: String!
    $submissions: [FieldValueInput]
    $browserInfo: JSON!
    $cachedCustomerId: String
  ) {
    widgetsSaveLead(
      formId: $formId
      submissions: $submissions
      browserInfo: $browserInfo
      cachedCustomerId: $cachedCustomerId
    ) {
      status
      conversationId
      customerId
      errors {
        fieldId
        code
        text
      }
    }
  }
`;
