import { gql } from '@apollo/client';

const GET_CONFIG_DETAIL = gql`
  query TicketConfigDetail($id: String!) {
    ticketConfigDetail(_id: $id) {
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

export { GET_CONFIG_DETAIL };
