import { useAutomationFolderView } from '@/automations/hooks/useAutomationFolderView';
import { automationExpandedFoldersState } from '@/automations/states/automationFolderRowsState';
import { useSetAtom } from 'jotai';
import { useCallback } from 'react';

/** Opening and closing a folder in place in the list. */
export const useAutomationFolderToggle = (folderId: string) => {
  const setExpandedIds = useSetAtom(automationExpandedFoldersState);

  return useCallback(
    () =>
      setExpandedIds((current) =>
        current.includes(folderId)
          ? current.filter((id) => id !== folderId)
          : [...current, folderId],
      ),
    [setExpandedIds, folderId],
  );
};

/** The footer of an open folder: the way to the folder's full page. */
export const useAutomationFolderFooterCell = (folderId: string) => {
  const { openFolder } = useAutomationFolderView();

  return { showAll: () => openFolder(folderId) };
};
