import { OperationVariables, useQuery } from '@apollo/client';
import { GET_POSITION_BY_ID } from '../graphql/queries/getPositions';

export const usePositionById = (options: OperationVariables) => {
  const { data, loading } = useQuery(GET_POSITION_BY_ID, {
    skip: !options.variables?.id,
    ...options,
  });
  const { positionDetail } = data || {};
  return { positionDetail, loading };
};
