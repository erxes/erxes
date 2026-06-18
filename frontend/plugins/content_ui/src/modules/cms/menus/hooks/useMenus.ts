import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
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

  const variables = useMemo(
    () => ({
      clientPortalId,
      limit: 100,
      kind,
      language,
      orderBy: { order: 1 },
    }),
    [clientPortalId, kind, language],
  );

  const { data, loading, error, refetch } = useQuery(CMS_MENU_LIST, {
    variables,
    skip: !clientPortalId,
    fetchPolicy: 'network-only',
  });

  const menus = useMemo(
    () => buildFlatTree(data?.cmsMenuList || [], language || 'en'),
    [data?.cmsMenuList, language],
  );

  return { menus, totalCount: menus.length, loading, error, refetch };
};
