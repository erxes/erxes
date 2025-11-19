import { gql } from '@apollo/client';

const GET_TICKET_CONFIGS = gql`
  query TicketConfigs($channelId: String!, $pipelineId: String) {
    ticketConfigs(channelId: $channelId, pipelineId: $pipelineId) {
      name
      channelId
      company {
        isShowName
        isShowRegistrationNumber
        isShowAddress
        isShowPhoneNumber
        isShowEmail
      }
      contactType
      createdAt
      customer {
        isShowFirstName
        isShowLastName
        isShowPhoneNumber
        isShowEmail
      }
      id
      pipelineId
      selectedStatusId
      ticketBasicFields {
        isShowName
        isShowDescription
        isShowAttachment
        isShowTags
      }
      updatedAt
    }
  }
`;

export { GET_TICKET_CONFIGS };
