import { gql } from '@apollo/client';

const GET_CONFIG_DETAIL = gql`
  query TicketConfigDetail($id: String!) {
    ticketConfigDetail(_id: $id) {
      id
      name
      selectedStatusId
      pipelineId
      channelId
      ticketBasicFields {
        isShowName
        isShowDescription
        isShowAttachment
        isShowTags
      }
      contactType
      company {
        isShowName
        isShowRegistrationNumber
        isShowAddress
        isShowPhoneNumber
        isShowEmail
      }
      customer {
        isShowFirstName
        isShowLastName
        isShowPhoneNumber
        isShowEmail
      }
      createdAt
      updatedAt
    }
  }
`;

export { GET_CONFIG_DETAIL };
