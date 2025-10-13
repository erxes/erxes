import { gql } from '@apollo/client';

export const EM_INTEGRATION_DETAIL_QUERY = gql`
  query integrationDetail($_id: String!) {
    integrationDetail(_id: $_id) {
      _id
      name
      languageCode
      channel {
        _id
      }
      messengerData
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
