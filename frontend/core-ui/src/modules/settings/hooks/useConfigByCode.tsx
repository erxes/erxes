import { OperationVariables, useQuery } from '@apollo/client';
import React from 'react';
import { SettingsQueries } from '../graphql';

const useConfigByCode = (options?: OperationVariables) => {
  const { data, loading, error } = useQuery(
    SettingsQueries.queryConfigsByCodes,
    {
      ...options,
      skip: !options?.variables?.codes,
    },
  );
  const configs = (data && data.configsByCode) || [];
  return {
    loading,
    configs,
    error,
  };
};

export { useConfigByCode };
