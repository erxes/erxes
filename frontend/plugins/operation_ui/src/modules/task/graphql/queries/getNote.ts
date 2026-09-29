import { graphql } from '~/gql';

export const GET_NOTE = graphql(`
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
