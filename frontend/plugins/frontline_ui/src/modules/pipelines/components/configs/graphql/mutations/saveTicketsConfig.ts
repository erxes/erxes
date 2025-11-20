import { gql } from '@apollo/client';

const SAVE_TICKETS_CONFIG = gql`
  mutation TicketSaveConfig($input: TicketConfigInput!) {
    ticketSaveConfig(input: $input) {
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

export { SAVE_TICKETS_CONFIG };
