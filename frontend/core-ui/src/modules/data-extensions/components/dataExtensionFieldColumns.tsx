import {
  IconArchive,
  IconArchiveOff,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  Combobox,
  Command,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  toast,
  useConfirm,
} from 'erxes-ui';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useDataExtensionFieldMutations } from '../hooks/useDataExtensionFieldMutations';
import { DataExtensionOptionBadge, IDataExtensionField } from 'ui-modules';
import { FieldTypeIcon } from './fieldTypeIcons';

const FieldActionsCell = ({
  cell,
  onEdit,
}: {
  cell: Cell<IDataExtensionField, unknown>;
  onEdit: (field: IDataExtensionField) => void;
}) => {
  const { t } = useTranslation('dataExtensions');
  const { confirm } = useConfirm();
  const { archiveField, restoreField, deleteField } =
    useDataExtensionFieldMutations();
  const field = cell.row.original;
  const archived = field.status === 'archived';

  const changeStatus = async () => {
    try {
      if (archived) {
        await restoreField(field._id);
      } else {
        await archiveField(field._id);
      }

      toast({
        variant: 'success',
        title: t(archived ? 'toast.field-restored' : 'toast.field-archived', {
          label: field.label,
        }),
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('toast.status-failed'),
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const handleStatus = () => {
    if (archived) {
      changeStatus();
      return;
    }

    confirm({
      message: t('archive-confirm', { label: field.label }),
      options: {
        description: t('archive-confirm-description'),
        okLabel: t('archive'),
      },
    }).then(changeStatus);
  };

  const handleDelete = () =>
    confirm({
      message: t('delete-confirm', { label: field.label }),
      options: {
        description: t(
          field.relation
            ? 'delete-confirm-description-relation'
            : 'delete-confirm-description',
          { key: field.key },
        ),
        confirmationValue: field.key,
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
        variants: { ok: 'destructive' },
      },
    }).then(async () => {
      try {
        await deleteField(field._id);
        toast({
          variant: 'success',
          title: t('toast.field-deleted', { label: field.label }),
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: t('toast.delete-failed'),
          description: error instanceof Error ? error.message : undefined,
        });
      }
    });

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton
          className="w-full h-full"
          aria-label={t('field-actions', { label: field.label })}
        />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            {!archived && (
              <Command.Item value="edit" onSelect={() => onEdit(field)}>
                <IconEdit /> {t('edit')}
              </Command.Item>
            )}
            <Command.Item value="status" onSelect={handleStatus}>
              {archived ? <IconArchiveOff /> : <IconArchive />}
              {archived ? t('restore') : t('archive')}
            </Command.Item>
            <Command.Separator className="my-1" />
            <Command.Item
              value="delete"
              onSelect={handleDelete}
              className="text-destructive"
            >
              <IconTrash /> {t('delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const getDataExtensionFieldColumns = ({
  t,
  canManage,
  onEdit,
  recordTypeLabel,
}: {
  t: TFunction;
  canManage: boolean;
  onEdit: (field: IDataExtensionField) => void;
  recordTypeLabel: (recordType: string) => string;
}): ColumnDef<IDataExtensionField>[] => [
  ...(canManage
    ? [
        {
          id: 'more',
          size: 33,
          cell: ({ cell }: { cell: Cell<IDataExtensionField, unknown> }) => (
            <FieldActionsCell cell={cell} onEdit={onEdit} />
          ),
        },
      ]
    : []),
  {
    id: 'label',
    accessorKey: 'label',
    size: 260,
    header: () => <RecordTable.InlineHead label={t('columns.label')} />,
    cell: ({ cell }) => {
      const field = cell.row.original;

      return (
        <RecordTableInlineCell className="gap-2">
          <FieldTypeIcon
            type={field.type}
            className={
              field.relation ? 'text-primary' : 'text-muted-foreground'
            }
          />
          <span className="truncate font-medium">{field.label}</span>
          {field.description && (
            <span
              className="truncate text-muted-foreground"
              title={field.description}
            >
              {field.description}
            </span>
          )}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'key',
    accessorKey: 'key',
    size: 200,
    header: () => <RecordTable.InlineHead label={t('columns.key')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <code className="truncate rounded bg-muted px-1.5 py-0.5 text-xs">
          {cell.getValue() as string}
        </code>
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'type',
    accessorKey: 'type',
    size: 140,
    header: () => <RecordTable.InlineHead label={t('columns.type')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <Badge variant={cell.row.original.relation ? 'info' : 'secondary'}>
          <FieldTypeIcon type={cell.row.original.type} className="size-3.5" />
          {t(`field-types.${cell.row.original.type}`)}
        </Badge>
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'options',
    size: 240,
    header: () => <RecordTable.InlineHead label={t('columns.details')} />,
    cell: ({ cell }) => {
      const { relation } = cell.row.original;
      const options = cell.row.original.options || [];

      if (relation) {
        const kind = t(
          relation.side === 'source'
            ? `relation.kinds.${relation.kind}`
            : `relation.inverse-kinds.${relation.kind}`,
        );

        return (
          <RecordTableInlineCell className="gap-1.5 overflow-hidden">
            <span aria-hidden="true" className="text-muted-foreground">
              {relation.side === 'source' ? '→' : '←'}
            </span>
            <span className="truncate font-medium">
              {recordTypeLabel(relation.targetRecordType)}
            </span>
            <span className="truncate text-muted-foreground">· {kind}</span>
          </RecordTableInlineCell>
        );
      }

      return (
        <RecordTableInlineCell className="gap-1 overflow-hidden">
          {options.length ? (
            options.slice(0, 3).map((option) => (
              <DataExtensionOptionBadge key={option.value} option={option} />
            ))
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
          {options.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{options.length - 3}
            </span>
          )}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    size: 120,
    header: () => <RecordTable.InlineHead label={t('columns.status')} />,
    cell: ({ cell }) => {
      const archived = cell.row.original.status === 'archived';

      return (
        <RecordTableInlineCell>
          <Badge variant={archived ? 'warning' : 'success'}>
            {archived ? t('status.archived') : t('status.active')}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    size: 160,
    header: () => <RecordTable.InlineHead label={t('columns.updated')} />,
    cell: ({ cell }) => {
      const value = cell.row.original.updatedAt;

      return (
        <RecordTableInlineCell className="text-muted-foreground">
          {value ? new Date(value).toLocaleString() : '—'}
        </RecordTableInlineCell>
      );
    },
  },
];
