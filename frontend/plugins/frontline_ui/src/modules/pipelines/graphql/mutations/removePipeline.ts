import { gql } from '@apollo/client';

export const REMOVE_PIPELINE = gql`
  mutation RemovePipeline($id: String!) {
    removePipeline(_id: $id)
  }
`;
