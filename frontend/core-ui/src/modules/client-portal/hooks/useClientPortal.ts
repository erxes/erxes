import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CLIENT_PORTAL } from '../graphql/queires/getClientPortal';
import { IClientPortal } from '../types/clientPortal';

export const useClientPortal = (
  _id: string,
  options?: QueryHookOptions<{ getClientPortal: IClientPortal }>,
) => {
  const { data, loading, error } = useQuery<{ getClientPortal: IClientPortal }>(
    GET_CLIENT_PORTAL,
    {
      variables: { _id },
      ...(options ?? {}),
    },
  );
  return { clientPortal: data?.getClientPortal, loading, error };
};
