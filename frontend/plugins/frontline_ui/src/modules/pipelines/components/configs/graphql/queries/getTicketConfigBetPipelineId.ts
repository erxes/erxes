import { gql } from '@apollo/client';

const GET_TICKET_CONFIG_BY_PIPELINE_ID = gql`
  query TicketConfig($pipelineId: String!) {
    ticketConfig(pipelineId: $pipelineId) {
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

export { GET_TICKET_CONFIG_BY_PIPELINE_ID };
