import { gql } from '@apollo/client';

export const CREATE_RELATIONS = gql`
  mutation createRelation($relation: RelationInput!) {
    createRelation(relation: $relation) {
      _id
    }
  }
`;
