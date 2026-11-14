import { AutomationFolderFormDialog } from '@/automations/components/list/folders/AutomationFolderFormDialog';
import { useAutomationFolderCard } from '@/automations/hooks/useAutomationFolderCard';
import { IAutomationFolder } from '@/automations/types';
import {
  IconDots,
  IconFolder,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react';
import { Badge, Button, DropdownMenu, IconComponent } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';

export const AutomationFolderCard = ({
  folder,
  onOpen,
}: {
  folder: IAutomationFolder;
  onOpen: () => void;
}) => {
  const { t } = useTranslation('automations');
  const { renaming, setRenaming, remove, removing } =
    useAutomationFolderCard(folder);

  return (
    <div className="group relative flex min-w-0 items-center gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-accent">
      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-label={t('folder-open', { name: folder.name })}
      />
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {folder.icon ? (
          <IconComponent name={folder.icon} className="size-4" />
        ) : (
          <IconFolder className="size-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{folder.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {t('folder-counts', {
            count: folder.automationCount,
            active: folder.activeCount,
          })}
          {folder.createdAt &&
            ` · ${new Date(folder.createdAt).toLocaleDateString()}`}
        </p>
      </div>
      {folder.installationId && (
        <Badge variant="secondary" className="shrink-0">
          {t('folder-from-template')}
        </Badge>
      )}
      <Can action="automationsUpdate">
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative shrink-0"
              disabled={removing}
              aria-label={t('folder-actions')}
            >
              <IconDots />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item onSelect={() => setRenaming(true)}>
              <IconPencil />
              {t('folder-rename')}
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item className="text-destructive" onSelect={remove}>
              <IconTrash />
              {t('folder-delete')}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </Can>
      <AutomationFolderFormDialog
        open={renaming}
        onOpenChange={setRenaming}
        folder={folder}
      />
    </div>
  );
};
