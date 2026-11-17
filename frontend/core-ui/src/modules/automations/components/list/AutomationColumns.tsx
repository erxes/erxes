import {
  AutomationsHotKeyScope,
  TAutomationListRow,
  TAutomationRecordTableColumnDefData,
} from '@/automations/types';
import { AutomationFolderRowCell } from '@/automations/components/list/folders/AutomationFolderRowCell';
import { isAutomationListRow } from '@/automations/hooks/useAutomationListRows';
import { IconCopy, IconEdit, IconLock, IconTrash } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { flexRender } from '@tanstack/react-table';
import {
  Avatar,
  Button,
  cn,
  DropdownMenu,
  IconComponent,
  Input,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { TagsSelect } from 'ui-modules';
import { AutomationExecutionCountCell } from '@/automations/components/list/AutomationExecutionCountCell';
import { AutomationRecentRunsStrip } from '@/automations/components/list/AutomationRecentRunsStrip';
import { AutomationRecordTableStatusInlineCell } from '@/automations/components/list/AutomationRecordTableStatusInlineCell';
import {
  useAutomationTriggerCell,
  useAutomationUpdatedCell,
} from '@/automations/hooks/useAutomationListCells';
import { useAutomationNameCell } from '@/automations/hooks/useAutomationNameCell';
import { useAutomationActions } from '@/automations/hooks/useAutomationActions';
import { useTranslation } from 'react-i18next';

const checkBoxColumn =
  RecordTable.checkboxColumn as ColumnDef<TAutomationRecordTableColumnDefData>;

type TAutomationColumn = ColumnDef<TAutomationRecordTableColumnDefData>;

/**
 * Folder headings and footers share the table's rows and columns, so each
 * column draws them too; the table's data is wider than the column type.
 */
const withFolderRows = (column: TAutomationColumn): TAutomationColumn => ({
  ...column,
  cell: (context) => {
    const row = context.row.original as TAutomationListRow;

    if (isAutomationListRow(row)) {
      return flexRender(column.cell, context);
    }

    return <AutomationFolderRowCell columnId={column.id || ''} row={row} />;
  },
});

const AutomationMoreCell = ({
  automation,
}: {
  automation: TAutomationRecordTableColumnDefData;
}) => {
  const { t } = useTranslation('automations');
  const { canWrite, duplicating, removing, onEdit, onDuplicate, onRemove } =
    useAutomationActions(automation);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild disabled={removing || duplicating}>
        <RecordTable.MoreButton className="w-full h-full" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="start"
        className="w-[140px] min-w-0 [&>button]:cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu.Item asChild onSelect={onEdit}>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <IconEdit className="size-4" />
            {t('edit')}
          </Button>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            disabled={duplicating}
            onClick={onDuplicate}
          >
            <IconCopy className="size-4" />
            {t('duplicate')}
          </Button>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive"
            disabled={!canWrite || removing}
            onClick={onRemove}
          >
            <IconTrash className="size-4" />
            {t('delete')}
          </Button>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

const NAME_ANCHOR_CLASS =
  'min-w-0 border-0 bg-transparent px-0 font-medium text-foreground shadow-none hover:bg-transparent hover:underline';

const AutomationNameDisplay = ({
  name,
  isPrivate,
  onOpen,
}: {
  name: string;
  isPrivate: boolean;
  onOpen: () => void;
}) => (
  <div className="flex min-w-0 items-center gap-1.5">
    {isPrivate && (
      <IconLock className="size-3.5 shrink-0 text-muted-foreground" />
    )}
    <RecordTableInlineCell.Anchor
      className={NAME_ANCHOR_CLASS}
      onClick={onOpen}
    >
      <span className="truncate">{name}</span>
    </RecordTableInlineCell.Anchor>
  </div>
);

const AutomationNameCell = ({
  automation,
}: {
  automation: TAutomationRecordTableColumnDefData;
}) => {
  const {
    automationId,
    isNested,
    isPrivate,
    currentName,
    editingName,
    setEditingName,
    canWrite,
    rename,
    openAutomation,
  } = useAutomationNameCell(automation);
  const display = (
    <AutomationNameDisplay
      name={currentName}
      isPrivate={isPrivate}
      onOpen={openAutomation}
    />
  );

  if (!canWrite) {
    return (
      <RecordTableInlineCell className={cn(isNested && 'pl-9')}>
        {display}
      </RecordTableInlineCell>
    );
  }

  return (
    <PopoverScoped
      closeOnEnter
      onEnter={rename}
      dependencies={[automationId, canWrite, currentName, editingName]}
    >
      <RecordTableInlineCell.Trigger className={cn(isNested && 'pl-9')}>
        {display}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Input
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

const AutomationTriggerCell = ({
  automation,
}: {
  automation: TAutomationRecordTableColumnDefData;
}) => {
  const { icon, label, hasTrigger, extraTriggersLabel, stepsLabel } =
    useAutomationTriggerCell(automation);

  return (
    <RecordTableInlineCell className="gap-2">
      <IconComponent
        name={icon}
        className="size-4 shrink-0 text-muted-foreground"
      />
      <span className={cn('truncate', !hasTrigger && 'text-muted-foreground')}>
        {label}
      </span>
      {extraTriggersLabel && (
        <span className="shrink-0 text-xs text-muted-foreground">
          {extraTriggersLabel}
        </span>
      )}
      <span className="ml-auto shrink-0 text-xs text-muted-foreground">
        {stepsLabel}
      </span>
    </RecordTableInlineCell>
  );
};

const AutomationUpdatedCell = ({
  automation,
}: {
  automation: TAutomationRecordTableColumnDefData;
}) => {
  const { updatedAt, userName, avatarSrc, initial } =
    useAutomationUpdatedCell(automation);

  return (
    <RecordTableInlineCell className="gap-2">
      {updatedAt && (
        <RelativeDateDisplay value={updatedAt} asChild>
          <span className="truncate text-muted-foreground">
            <RelativeDateDisplay.Value value={updatedAt} />
          </span>
        </RelativeDateDisplay>
      )}
      {userName && (
        <Avatar className="ml-auto size-5 shrink-0" title={userName}>
          <Avatar.Image src={avatarSrc} alt={userName} />
          <Avatar.Fallback className="text-[10px]">{initial}</Avatar.Fallback>
        </Avatar>
      )}
    </RecordTableInlineCell>
  );
};

export const getAutomationColumns: (
  t: (key: string) => string,
) => TAutomationColumn[] = (t) => {
  const columns: TAutomationColumn[] = [
    {
      id: 'more',
      cell: ({ cell }) => <AutomationMoreCell automation={cell.row.original} />,
      size: 33,
      maxSize: 33,
      minSize: 33,
    },
    checkBoxColumn,
    {
      id: 'name',
      accessorKey: 'name',
      header: () => <RecordTable.InlineHead label={t('name')} />,
      cell: ({ cell }) => <AutomationNameCell automation={cell.row.original} />,
      size: 320,
      minSize: 200,
    },
    {
      id: 'trigger',
      header: () => <RecordTable.InlineHead label={t('list-trigger')} />,
      cell: ({ cell }) => (
        <AutomationTriggerCell automation={cell.row.original} />
      ),
      size: 240,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: () => <RecordTable.InlineHead label={t('status')} />,
      cell: ({ cell }) => <AutomationRecordTableStatusInlineCell cell={cell} />,
      size: 100,
    },
    {
      id: 'recentRuns',
      header: () => <RecordTable.InlineHead label={t('history-last-runs')} />,
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <AutomationRecentRunsStrip automationId={cell.row.original._id} />
        </RecordTableInlineCell>
      ),
      size: 180,
    },
    {
      id: 'executionCount',
      header: () => <RecordTable.InlineHead label={t('runs')} />,
      cell: ({ cell }) => (
        <AutomationExecutionCountCell id={cell.row.original._id} />
      ),
      size: 80,
    },
    {
      id: 'tagIds',
      accessorKey: 'tagIds',
      header: () => <RecordTable.InlineHead label={t('tags')} />,
      cell: ({ cell }) => (
        <TagsSelect.InlineCell
          scope={AutomationsHotKeyScope.AutomationsTableInlinePopover}
          type="core:automation"
          mode="multiple"
          value={cell.row.original.tagIds || []}
          targetIds={[cell.row.original._id]}
          options={(newSelectedTagIds) => ({
            update: (cache) => {
              cache.modify({
                id: cache.identify({
                  __typename: 'Automation',
                  _id: cell.row.original._id,
                }),
                fields: { tagIds: () => newSelectedTagIds },
              });
            },
          })}
        />
      ),
      size: 180,
    },
    {
      id: 'updatedAt',
      accessorKey: 'updatedAt',
      header: () => <RecordTable.InlineHead label={t('list-updated')} />,
      cell: ({ cell }) => (
        <AutomationUpdatedCell automation={cell.row.original} />
      ),
      size: 170,
    },
  ];

  return columns.map(withFolderRows);
};
