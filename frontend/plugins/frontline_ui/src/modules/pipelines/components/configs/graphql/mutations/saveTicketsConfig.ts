import { gql } from '@apollo/client';

const SAVE_TICKETS_CONFIG = gql`
  mutation TicketSaveConfig($input: TicketConfigInput!) {
    ticketSaveConfig(input: $input) {
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

export { SAVE_TICKETS_CONFIG };
