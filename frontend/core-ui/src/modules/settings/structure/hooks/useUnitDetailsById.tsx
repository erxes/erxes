import { OperationVariables, useQuery } from '@apollo/client';
import { GET_UNIT_DETAILS_BY_ID } from '../graphql';

const useUnitDetailsById = (options: OperationVariables) => {
  const { data, loading } = useQuery(GET_UNIT_DETAILS_BY_ID, {
    skip: !options.variables?.id,
    ...options,
  });
  const { unitDetail } = data || {};
  return { unitDetail, loading };
};

export { useUnitDetailsById };
