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

export const FORM_CONNECT = gql`
  mutation connect(
    $integrationId: String!
    $visitorId: String
    $cachedCustomerId: String
    $email: String
    $isUser: Boolean
    $phone: String
    $code: String
    $data: JSON
    $companyData: JSON
  ) {
    widgetsMessengerConnect(
      integrationId: $integrationId
      visitorId: $visitorId
      cachedCustomerId: $cachedCustomerId
      email: $email
      isUser: $isUser
      phone: $phone
      code: $code
      data: $data
      companyData: $companyData
    ) {
      integrationId
      messengerData
      languageCode
      uiOptions
      customerId
      visitorId
      ticketConfig
      customer {
        _id
        firstName
        lastName
        phones
        emails
      }
    }
  }
`;
