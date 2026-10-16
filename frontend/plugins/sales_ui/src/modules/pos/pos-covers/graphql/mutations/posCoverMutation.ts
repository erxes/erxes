import { gql } from '~/gql';

export const DELETE_POS_COVER_MUTATION = gql(`
  mutation PosCoversRemove($id: String!) {
    posCoversRemove(_id: $id)
  }
`);
