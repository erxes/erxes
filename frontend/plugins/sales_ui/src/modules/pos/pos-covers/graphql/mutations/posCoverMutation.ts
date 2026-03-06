import { gql } from '@apollo/client';

export const DELETE_POS_COVER_MUTATION = gql`
  mutation PosCoversRemove($id: String!) {
    posCoversRemove(_id: $id)
  }
`;
