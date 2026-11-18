import { useAutomationFolderChildren } from '@/automations/hooks/useAutomationFolderChildren';

/** Renders nothing: it owns one open folder's request. */
export const AutomationFolderChildrenLoader = ({
  folderId,
}: {
  folderId: string;
}) => {
  useAutomationFolderChildren(folderId);

  return null;
};
