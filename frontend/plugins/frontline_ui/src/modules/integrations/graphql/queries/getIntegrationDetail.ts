import { gql } from '~/gql';

export const GET_INTEGRATION_DETAIL = gql(`
  query IntegrationDetail($id: String!) {
    integrationDetail(_id: $id) {
      _id
      kind
      name
      languageCode
      code
      tagIds
      createdAt
      leadData
      messengerData
      uiOptions
      isConnected
      channelId
      channel {
        _id
        name
      }
      brandId
      sharedEntityIds
      details
      facebookPage {
        pageId
        id
        name
      }
      instagramPage
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
`);
