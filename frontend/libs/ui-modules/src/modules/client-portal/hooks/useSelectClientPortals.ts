import { useQuery } from '@apollo/client';
import {
  CLIENT_PORTAL_SELECT_DETAIL,
  CLIENT_PORTAL_SELECT_LIST,
} from '../graphql/queries/clientPortalQueries';
import { IClientPortalOption } from '../types/clientPortal';

export const useSelectClientPortals = () => {
  const { data, loading, error } = useQuery<{
    getClientPortals: { list: IClientPortalOption[]; totalCount: number };
  }>(CLIENT_PORTAL_SELECT_LIST);

  return {
    clientPortals: data?.getClientPortals?.list ?? [],
    loading,
    error,
  };
};

export const useSelectClientPortalDetail = (_id?: string, skip?: boolean) => {
  const { data, loading } = useQuery<{
    getClientPortal: IClientPortalOption | null;
  }>(CLIENT_PORTAL_SELECT_DETAIL, {
    variables: { _id },
    skip: !_id || skip,
  });

  return { clientPortal: data?.getClientPortal ?? undefined, loading };
};
