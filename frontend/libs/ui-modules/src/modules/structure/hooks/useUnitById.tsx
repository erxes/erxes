import { OperationVariables, useQuery } from '@apollo/client';
import { GET_UNIT_BT_ID } from '../graphql/queries/getUnits';

export const useUnitById = (options: OperationVariables) => {
  const { data, loading, error } = useQuery(GET_UNIT_BT_ID, {
    skip: !options.variables?._id,
    ...options,
  });
  const { unitDetail } = data || {};
  return { unitDetail, loading, error };
};
