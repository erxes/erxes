import { gql } from '@apollo/client';

const REMOVE_TICKET_CONFIG = gql`
  mutation TicketRemoveConfig($id: String!) {
    ticketRemoveConfig(_id: $id) {
      name
      channelId
      createdAt
      id
      pipelineId
      selectedStatusId
      parentId
      formFields {
        name {
          isShow
          label
          order
          placeholder
        }
        description {
          isShow
          label
          order
          placeholder
        }
        attachment {
          isShow
          label
          order
          placeholder
        }
        tags {
          isShow
          label
          order
          placeholder
        }
      }
      updatedAt
    }
  }
`;

export { REMOVE_TICKET_CONFIG };
