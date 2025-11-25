import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CLIENT_PORTALS } from '@/client-portal/graphql/queires/getClientPortals';
import { IClientPortal } from '@/client-portal/types/clientPortal';
import { ICursorListResponse } from 'erxes-ui';

export const useClientPortals = (
  options?: QueryHookOptions<ICursorListResponse<IClientPortal>>,
) => {
  const { data, loading, error } = useQuery<ICursorListResponse<IClientPortal>>(
    GET_CLIENT_PORTALS,
    options,
  );

  const {
    list: clientPortals,
    totalCount = 0,
    pageInfo,
  } = data?.getClientPortals || {};

  return { clientPortals, loading, error, totalCount, pageInfo };
};

export default useClientPortals;
