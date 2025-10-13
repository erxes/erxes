import { gql } from '@apollo/client';

export const GET_INTEGRATION_DETAIL = gql`
  query IntegrationDetail($id: String!) {
    integrationDetail(_id: $id) {
      _id
      kind
      name
      brandId
      languageCode
      code
      tagIds
      createdAt
      leadData
      messengerData
      uiOptions
      isConnected
      channels {
        _id
        name
      }
      departmentIds
      details
      facebookPage
      callData {
        secondPageHeader
        secondPageDescription
        departments {
          _id
          name
          operators
        }
        description
        header
        isReceiveWebCall
      }
      isActive
    }
  }
`;
