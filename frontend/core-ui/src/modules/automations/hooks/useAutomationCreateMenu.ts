import { AUTOMATION_GALLERY_PATH } from '@/automations/hooks/useAutomationCreateDialog';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissionCheck } from 'ui-modules';

/**
 * The one create menu in the header: an automation (blank or from a
 * template, through the create dialog), the template gallery, or a folder.
 */
export const useAutomationCreateMenu = (openCreateDialog: () => void) => {
  const navigate = useNavigate();
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const can = (action: string) => isLoaded && hasActionPermission(action);

  const openGallery = useCallback(
    () => navigate(AUTOMATION_GALLERY_PATH),
    [navigate],
  );
  const openFolderDialog = useCallback(() => setFolderDialogOpen(true), []);

  return {
    canCreate: can('automationsCreate'),
    canUseTemplates: can('templatesInstall'),
    canCreateFolder: can('automationsUpdate'),
    openCreateDialog,
    openGallery,
    folderDialogOpen,
    setFolderDialogOpen,
    openFolderDialog,
  };
};
