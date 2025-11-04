import { gql } from '@apollo/client';

export const CREATE_RELATIONS = gql`
  mutation createRelation($relation: RelationInput!) {
    createRelation(relation: $relation) {
      _id
    }
  }
`;

export const CREATE_MULTIPLE_RELATIONS = gql`
  mutation createMultipleRelations($relations: [RelationInput!]!) {
    createMultipleRelations(relations: $relations)
  }
`;
