import { AutomationFolderFormDialog } from '@/automations/components/list/folders/AutomationFolderFormDialog';
import { useAutomationCreateMenu } from '@/automations/hooks/useAutomationCreateMenu';
import {
  IconAffiliate,
  IconChevronDown,
  IconFolderPlus,
  IconTemplate,
} from '@tabler/icons-react';
import { Button, DropdownMenu, Kbd } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationCreateMenu = ({
  onCreateAutomation,
}: {
  onCreateAutomation: () => void;
}) => {
  const { t } = useTranslation('automations');
  const {
    canCreate,
    canUseTemplates,
    canCreateFolder,
    openCreateDialog,
    openGallery,
    folderDialogOpen,
    setFolderDialogOpen,
    openFolderDialog,
  } = useAutomationCreateMenu(onCreateAutomation);

  if (!canCreate && !canCreateFolder) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button>
            {t('create')}
            <IconChevronDown />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" className="min-w-52">
          {canCreate && (
            <DropdownMenu.Item onSelect={openCreateDialog}>
              <IconAffiliate />
              {t('list-create-automation')}
              <Kbd className="ml-auto">C</Kbd>
            </DropdownMenu.Item>
          )}
          {canCreate && canUseTemplates && (
            <DropdownMenu.Item onSelect={openGallery}>
              <IconTemplate />
              {t('list-create-from-template')}
            </DropdownMenu.Item>
          )}
          {canCreate && canCreateFolder && <DropdownMenu.Separator />}
          {canCreateFolder && (
            <DropdownMenu.Item onSelect={openFolderDialog}>
              <IconFolderPlus />
              {t('folder-new')}
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu>
      <AutomationFolderFormDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
      />
    </>
  );
};
