import { gql } from '@apollo/client';

export const EM_INTEGRATION_DETAIL_QUERY = gql`
  query integrationDetail($_id: String!) {
    integrationDetail(_id: $_id) {
      _id
      name
      languageCode
      brandId
      channel {
        _id
        name
      }
      messengerData
      ticketConfigId
      websiteMessengerApps {
        _id
        kind
        showInInbox
        credentials {
          integrationId
          description
          buttonText
          url
        }
      }
      callData {
        header
        description
        secondPageHeader
        secondPageDescription
        departments {
          _id
          name
          operators
        }
        isReceiveWebCall
      }
      uiOptions
    }
  }
`;
