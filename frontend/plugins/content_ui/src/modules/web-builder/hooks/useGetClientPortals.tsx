import { useQuery } from '@apollo/client';
import { GET_CLIENT_PORTALS } from '../graphql/queries/getClientPortals';

export interface IClientPortal {
  _id: string;
  name: string;
}

export const useGetClientPortals = () => {
  const { data, loading } = useQuery(GET_CLIENT_PORTALS, {
    fetchPolicy: 'cache-first',
  });

  const portals: IClientPortal[] = data?.getClientPortals?.list || [];

  return { portals, loading };
};
