import { AUTOMATIONS_MAIN_LIST } from '@/automations/graphql/automationQueries';
import { automationFolderChildrenState } from '@/automations/states/automationFolderRowsState';
import { IAutomation } from '@/automations/types';
import { useQuery } from '@apollo/client';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';

// An open folder lists this many; the folder page has the rest
export const FOLDER_CHILDREN_LIMIT = 50;

/**
 * One open folder's automations, published to the folder rows atom. A watched
 * query, so a move, rename or delete refetching the list updates it too.
 */
export const useAutomationFolderChildren = (folderId: string) => {
  const setChildren = useSetAtom(automationFolderChildrenState);
  const { data, loading } = useQuery<{
    automationsMain: { list: IAutomation[]; totalCount: number };
  }>(AUTOMATIONS_MAIN_LIST, {
    variables: { folderId, limit: FOLDER_CHILDREN_LIMIT },
  });

  useEffect(() => {
    const { list = [], totalCount = 0 } = data?.automationsMain || {};

    setChildren((current) => ({
      ...current,
      [folderId]: { list, totalCount, loading },
    }));
  }, [data, loading, folderId, setChildren]);
};
