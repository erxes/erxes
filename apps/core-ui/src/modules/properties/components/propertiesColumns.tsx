import type { Field } from '@erxes/core-contract';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { Cell, ColumnDef } from '@tanstack/react-table';
import { Checkbox, DropdownMenu, IconComponent, RecordTable, RecordTableInlineCell, Switch } from 'erxes-ui';
import type { TFunction } from 'i18next';
import { useAtom, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PROPERTIES_BASE_PATH } from '../constants';
import { FIELD_TYPES_OBJECT } from '../fieldTypes';
import { archiveTargetState, selectedFieldIdsState } from '../states';
import { useCanManageFields, useEditProperty } from '../usePropertyMutations';

/** The edit page of a field (old `/:type/:groupId/:id`). */
export const propertyEditPath = (field: Field) =>
  `${PROPERTIES_BASE_PATH}/${field.contentType}/${field.groupId ?? 'ungrouped'}/${field.id}`;

const PropertiesCheckboxCell = ({ id }: { id: string }) => {
  const [selectedFieldIds, setSelectedFieldIds] = useAtom(selectedFieldIdsState);

  return (
    <div className="flex items-center justify-center" onClick={(event) => event.stopPropagation()}>
      <Checkbox
        checked={!!selectedFieldIds[id]}
        onCheckedChange={(value) =>
          setSelectedFieldIds((prev) => {
            const isChecked = !!value;
            if (isChecked === !!prev[id]) return prev;
            const next = { ...prev };
            if (isChecked) next[id] = true;
            else delete next[id];
            return next;
          })
        }
      />
    </div>
  );
};

const PropertiesHeaderCheckboxCell = ({ ids }: { ids: string[] }) => {
  const [selectedFieldIds, setSelectedFieldIds] = useAtom(selectedFieldIdsState);
  const allSelected = ids.length > 0 && ids.every((id) => selectedFieldIds[id]);
  const someSelected = ids.some((id) => selectedFieldIds[id]);

  return (
    <div className="flex items-center justify-center h-8">
      <Checkbox
        checked={allSelected || (someSelected && 'indeterminate')}
        onCheckedChange={(value) =>
          setSelectedFieldIds((prev) => {
            const next = { ...prev };
            ids.forEach((id) => {
              if (value) next[id] = true;
              else delete next[id];
            });
            return next;
          })
        }
      />
    </div>
  );
};

const PropertiesMoreColumnCell = ({ cell }: { cell: Cell<Field, unknown> }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const manager = useCanManageFields();
  const field = cell.row.original;
  const setArchiveTarget = useSetAtom(archiveTargetState);
  const setSelectedFieldIds = useSetAtom(selectedFieldIdsState);

  if (!manager) {
    return null;
  }

  const handleRemove = () => {
    setArchiveTarget({ kind: 'fields', ids: [field.id], label: `"${field.label}"` });
    setSelectedFieldIds((prev) => {
      if (!prev[field.id]) return prev;
      const next = { ...prev };
      delete next[field.id];
      return next;
    });
  };

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <RecordTable.MoreButton />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="min-w-48">
          <DropdownMenu.Item asChild>
            <Link to={propertyEditPath(field)}>
              <IconEdit />
              {t('edit', 'Edit')}
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={handleRemove}>
            <IconTrash />
            {t('remove', 'Remove')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
};

const PropertyVisibleCell = ({ cell, label }: { cell: Cell<Field, unknown>; label: string }) => {
  const { mutate } = useEditProperty();
  const manager = useCanManageFields();
  const { id, isVisible } = cell.row.original;

  return (
    <RecordTableInlineCell>
      <div className="flex items-center justify-center w-full" onClick={(event) => event.stopPropagation()}>
        <Switch
          size="sm"
          aria-label={label}
          disabled={!manager}
          checked={isVisible}
          onCheckedChange={(value) => mutate({ id, isVisible: value })}
        />
      </div>
    </RecordTableInlineCell>
  );
};

export const propertiesColumns = (t: TFunction, { fieldIds }: { fieldIds: string[] }): ColumnDef<Field>[] => [
  {
    id: 'checkbox',
    accessorKey: 'checkbox',
    header: () => <PropertiesHeaderCheckboxCell ids={fieldIds} />,
    cell: ({ row }) => <PropertiesCheckboxCell id={row.original.id} />,
    size: 33,
  },
  {
    id: 'name',
    accessorKey: 'label',
    header: () => <RecordTable.InlineHead label={t('name', 'Name')} />,
    cell: ({ cell }) => {
      const { label, icon, type } = cell.row.original;
      const TypeIcon = FIELD_TYPES_OBJECT[type]?.icon;

      return (
        <RecordTableInlineCell>
          <div className="flex items-center gap-2 overflow-hidden">
            {icon ? (
              <IconComponent className="h-4 w-4 shrink-0 text-muted-foreground" name={icon} />
            ) : (
              TypeIcon && <TypeIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate">{label}</span>
          </div>
        </RecordTableInlineCell>
      );
    },
    size: 220,
  },
  {
    id: 'dataType',
    accessorKey: 'type',
    header: () => <RecordTable.InlineHead label={t('data-type', 'Data type')} />,
    cell: ({ cell }) => {
      const fieldType = FIELD_TYPES_OBJECT[cell.row.original.type];
      const Icon = fieldType?.icon;

      return (
        <RecordTableInlineCell>
          <div className="flex items-center gap-2 text-muted-foreground overflow-hidden">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            <span className="truncate">{fieldType && t(`field-type.${fieldType.i18nKey}`, fieldType.label)}</span>
          </div>
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead label={t('code', 'Code')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <span className="truncate text-muted-foreground">{cell.row.original.code || '—'}</span>
      </RecordTableInlineCell>
    ),
    size: 160,
  },
  {
    id: 'isVisible',
    accessorKey: 'isVisible',
    header: () => <RecordTable.InlineHead label={t('visible', 'Visible')} />,
    cell: ({ cell }) => <PropertyVisibleCell cell={cell} label={t('visible', 'Visible')} />,
    size: 90,
  },
  {
    id: 'more',
    cell: ({ cell }) => <PropertiesMoreColumnCell cell={cell} />,
    size: 33,
  },
];
