import { gql } from '@apollo/client';

export const PRODUCTS_CONFIGS_UPDATE = gql`
  mutation ProductsConfigsUpdate($configsMap: JSON!) {
    productsConfigsUpdate(configsMap: $configsMap)
  }
`;
