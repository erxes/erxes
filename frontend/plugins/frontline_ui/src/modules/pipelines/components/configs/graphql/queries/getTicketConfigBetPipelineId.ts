import { gql } from '@apollo/client';

const GET_TICKET_CONFIG_BY_PIPELINE_ID = gql`
  query TicketConfig($pipelineId: String!) {
    ticketConfig(pipelineId: $pipelineId) {
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

export { GET_TICKET_CONFIG_BY_PIPELINE_ID };
