import { gql } from '@apollo/client';

const REMOVE_BRANDS = gql`
  mutation BrandsRemove($ids: [String!]) {
    brandsRemove(_ids: $ids)
  }
`;

export { REMOVE_BRANDS };
