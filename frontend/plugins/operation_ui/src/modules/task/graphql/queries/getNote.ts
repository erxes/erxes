import { gql } from '~/gql';

export const GET_NOTE = gql(`
  query GetNote($id: String!) {
    getNote(_id: $id) {
      _id
      content
      createdAt
      createdBy
      contentId
      mentions
      updatedAt
    }
  }
`);
