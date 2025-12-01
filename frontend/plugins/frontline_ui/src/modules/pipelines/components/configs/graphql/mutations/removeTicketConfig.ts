import { gql } from '@apollo/client';

const REMOVE_TICKET_CONFIG = gql`
  mutation TicketRemoveConfig($id: String!) {
    ticketRemoveConfig(_id: $id) {
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

export { REMOVE_TICKET_CONFIG };
