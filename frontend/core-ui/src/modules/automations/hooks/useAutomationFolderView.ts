import { useAutomationFolders } from '@/automations/hooks/useAutomationFolders';
import { useAutomationRecordTableFilters } from '@/automations/hooks/useAutomationRecordTableFilters';
import { useQueryState } from 'erxes-ui';

/** Which folder the list is in; none means the top of the list. */
export const useAutomationFolderView = () => {
  const [folderId, setFolderId] = useQueryState<string>('folderId');
  const { folders, loading } = useAutomationFolders();
  const folder = folders.find(({ _id }) => _id === folderId);
  // Folders show at the top while nothing narrows the list
  const { withoutFolder } = useAutomationRecordTableFilters();

  return {
    folderId: folderId || undefined,
    folder,
    folders,
    loading,
    showFolders: !!withoutFolder,
    openFolder: (id: string | null) => setFolderId(id),
  };
};
