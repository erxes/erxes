import { AutomationFolderFormDialog } from '@/automations/components/list/folders/AutomationFolderFormDialog';
import { useAutomationFolderCard } from '@/automations/hooks/useAutomationFolderCard';
import {
  useAutomationFolderFooterCell,
  useAutomationFolderToggle,
} from '@/automations/hooks/useAutomationFolderListRow';
import {
  TAutomationFolderFooterListRow,
  TAutomationFolderListRow,
} from '@/automations/types';
import {
  IconChevronRight,
  IconDots,
  IconFolder,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  cn,
  DropdownMenu,
  IconComponent,
  RecordTableInlineCell,
  Spinner,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';

const AutomationFolderMenuCell = ({
  row,
}: {
  row: TAutomationFolderListRow;
}) => {
  const { t } = useTranslation('automations');
  const { renaming, setRenaming, remove, removing } = useAutomationFolderCard(
    row.folder,
  );

  return (
    <Can action="automationsUpdate">
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-full w-full rounded-none"
            disabled={removing}
            aria-label={t('folder-actions')}
          >
            <IconDots />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="start">
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
      <AutomationFolderFormDialog
        open={renaming}
        onOpenChange={setRenaming}
        folder={row.folder}
      />
    </Can>
  );
};

const AutomationFolderNameCell = ({
  row,
}: {
  row: TAutomationFolderListRow;
}) => {
  const { t } = useTranslation('automations');
  const toggle = useAutomationFolderToggle(row.folder._id);
  const { folder, expanded, loading } = row;

  return (
    <RecordTableInlineCell className="p-0">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        aria-label={t('folder-open', { name: folder.name })}
        className="flex h-full w-full min-w-0 items-center gap-2 px-2 text-left outline-none focus-visible:underline"
      >
        <IconChevronRight
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform',
            expanded && 'rotate-90',
          )}
        />
        {folder.icon ? (
          <IconComponent name={folder.icon} className="size-4 shrink-0" />
        ) : (
          <IconFolder className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="min-w-0 truncate font-medium">{folder.name}</span>
        {loading && <Spinner size="sm" containerClassName="flex-none" />}
      </button>
    </RecordTableInlineCell>
  );
};

const AutomationFolderSummaryCell = ({
  row,
}: {
  row: TAutomationFolderListRow;
}) => {
  const { t } = useTranslation('automations');

  return (
    <RecordTableInlineCell className="gap-2 text-muted-foreground">
      <span className="truncate">
        {t('folder-counts', {
          count: row.folder.automationCount,
          active: row.folder.activeCount,
        })}
      </span>
      {row.folder.installationId && (
        <Badge variant="secondary" className="shrink-0">
          {t('folder-from-template')}
        </Badge>
      )}
    </RecordTableInlineCell>
  );
};

const AutomationFolderFooterCell = ({
  row,
}: {
  row: TAutomationFolderFooterListRow;
}) => {
  const { t } = useTranslation('automations');
  const { showAll } = useAutomationFolderFooterCell(row.folderId);

  return (
    <RecordTableInlineCell className="pl-9">
      {row.hiddenCount > 0 ? (
        <Button variant="link" size="sm" className="px-0" onClick={showAll}>
          {t('folder-show-all', { count: row.hiddenCount })}
        </Button>
      ) : (
        <span className="text-xs text-muted-foreground">
          {t('folder-empty-title')}
        </span>
      )}
    </RecordTableInlineCell>
  );
};

// Each column of a folder row: the menu, the name, the counts, else blank
const FOLDER_CELLS: Record<
  string,
  React.ComponentType<{ row: TAutomationFolderListRow }>
> = {
  more: AutomationFolderMenuCell,
  name: AutomationFolderNameCell,
  trigger: AutomationFolderSummaryCell,
};

/** A folder heading or footer, drawn in the list's own columns. */
export const AutomationFolderRowCell = ({
  columnId,
  row,
}: {
  columnId: string;
  row: TAutomationFolderListRow | TAutomationFolderFooterListRow;
}) => {
  if (row.kind === 'folderFooter') {
    return columnId === 'name' ? (
      <AutomationFolderFooterCell row={row} />
    ) : null;
  }

  const Cell = FOLDER_CELLS[columnId];

  return Cell ? <Cell row={row} /> : null;
};
