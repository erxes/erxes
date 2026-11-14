import { useAutomationFolderView } from '@/automations/hooks/useAutomationFolderView';
import { useAutomationMoveToFolder } from '@/automations/hooks/useAutomationMoveToFolder';
import { IAutomation } from '@/automations/types';
import { IconFolder, IconFolderSymlink, IconFolderX } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, DropdownMenu, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationMoveToFolderCommandBar = ({
  rows,
}: {
  rows: Row<IAutomation>[];
}) => {
  const { t } = useTranslation('automations');
  const { folderId, folders } = useAutomationFolderView();
  const { move, moving } = useAutomationMoveToFolder(rows);
  const others = folders.filter(({ _id }) => _id !== folderId);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary" disabled={moving}>
          {moving ? <Spinner /> : <IconFolderSymlink />}
          {t('folder-move')}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start" className="max-h-80 overflow-y-auto">
        {others.map((folder) => (
          <DropdownMenu.Item
            key={folder._id}
            onSelect={() => move(folder._id, folder.name)}
          >
            <IconFolder />
            <span className="truncate">{folder.name}</span>
            {folder.createdAt && (
              <span className="ml-auto pl-3 text-xs text-muted-foreground">
                {new Date(folder.createdAt).toLocaleDateString()}
              </span>
            )}
          </DropdownMenu.Item>
        ))}
        {!others.length && (
          <DropdownMenu.Label className="font-normal text-muted-foreground">
            {t('folder-move-none')}
          </DropdownMenu.Label>
        )}
        {folderId && (
          <>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onSelect={() => move(null)}>
              <IconFolderX />
              {t('folder-move-out')}
            </DropdownMenu.Item>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
