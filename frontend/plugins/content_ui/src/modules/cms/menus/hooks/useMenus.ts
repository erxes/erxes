import { useQuery } from '@apollo/client';
import { CMS_MENU_LIST } from '../../graphql/queries';
import { buildFlatTree } from '../menuUtils';

export const useMenus = ({
  clientPortalId,
  kind,
}: {
  clientPortalId: string;
  kind?: string;
}) => {
  const { data, loading, error, refetch } = useQuery(CMS_MENU_LIST, {
    variables: { clientPortalId, limit: 50, kind },
    skip: !clientPortalId,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const menus = buildFlatTree(data?.cmsMenuList || []);

  return { menus, totalCount: menus.length, loading, error, refetch };
};
