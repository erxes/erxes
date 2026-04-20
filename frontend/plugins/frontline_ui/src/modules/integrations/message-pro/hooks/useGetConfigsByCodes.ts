import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CONFIGS_BY_CODES } from '../graphql';
import { IConfigItem } from '../types';

type TQueryResponse = {
  configsByCode: IConfigItem[];
};

export const useGetConfigsByCodes = (options?: QueryHookOptions) => {
  const { data, error, loading } = useQuery<TQueryResponse>(
    GET_CONFIGS_BY_CODES,
    options,
  );
  const configs = data?.configsByCode || [];

  return {
    configs,
    error,
    loading,
  };
};
