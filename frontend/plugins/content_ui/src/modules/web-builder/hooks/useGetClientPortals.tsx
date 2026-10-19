import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { compactList } from '@/cms/shared/utils';
import { GET_CLIENT_PORTALS } from '../graphql/queries/getClientPortals';

export interface IClientPortal {
  _id: string;
  name: string;
}

export const useGetClientPortals = () => {
  const { data, loading } = useQuery(GET_CLIENT_PORTALS, {
    fetchPolicy: 'cache-first',
  });

  const portals: IClientPortal[] = useMemo(
    () => compactList(data?.getClientPortals?.list),
    [data?.getClientPortals?.list],
  );

  return { portals, loading };
};
