import gql from 'graphql-tag';
import { queries } from '../graphql';

export const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.paymentConfigs),
      variables: {
        paymentConfigIds: []
      }
    },
    {
      query: gql(queries.paymentConfigsCountByType)
    }
  ];
};
