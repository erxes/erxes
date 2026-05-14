import { QueryHookOptions, useQuery } from '@apollo/client';
import { UOMS } from '../graphql/queries/getUoms';
import { IUom } from 'ui-modules';

export const useUoms = (options?: QueryHookOptions) => {
  const { data, loading } = useQuery<{ uoms: IUom[] }>(UOMS, options);

  const { uoms } = data || {};

  return { uoms, loading };
};
