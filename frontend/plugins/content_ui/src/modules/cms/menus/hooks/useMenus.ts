import { useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { CMS_MENU_LIST } from '../../graphql/queries';
import { cmsLanguageAtom } from '../../shared/states/cmsLanguageState';
import { buildFlatTree } from '../menuUtils';

export const useMenus = ({
  clientPortalId,
  kind,
}: {
  clientPortalId: string;
  kind?: string;
}) => {
  const language = useAtomValue(cmsLanguageAtom);

  const { data, loading, error, refetch } = useQuery(CMS_MENU_LIST, {
    variables: { clientPortalId, limit: 50, kind, language },
    skip: !clientPortalId,
    fetchPolicy: 'network-only',
  });

  const menus = buildFlatTree(data?.cmsMenuList || []);

  return { menus, totalCount: menus.length, loading, error, refetch };
};
