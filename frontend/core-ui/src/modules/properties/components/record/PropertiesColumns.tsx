import {
  Badge,
  Checkbox,
  DropdownMenu,
  IconComponent,
  RecordTable,
  RecordTableInlineCell,
  Spinner,
  Switch,
  useConfirm,
} from 'erxes-ui';
import { CORE_RELATION_TYPES, Can, IField } from 'ui-modules';
import type { Cell, ColumnDef } from '@tanstack/react-table';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useAtom, useSetAtom } from 'jotai';

import { FIELD_TYPES_OBJECT } from '../../constants/fieldTypes';
import { Link } from 'react-router-dom';
import React from 'react';
import type { TFunction } from 'i18next';
import { selectedFieldIdsState } from '../../states/selectedFieldsState';
import { useEditProperty } from '../../hooks/useEditProperty';
import { useFieldRemove } from '../../hooks/useFieldRemove';
import { useTranslation } from 'react-i18next';

const PropertiesCheckboxCell = ({ id }: { id: string }) => {
  const [selectedFieldIds, setSelectedFieldIds] = useAtom(
    selectedFieldIdsState,
  );

  return (
    <div
      className="flex items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <Checkbox
        checked={!!selectedFieldIds[id]}
        onCheckedChange={(value) =>
          setSelectedFieldIds((prev) => {
            const isChecked = !!value;
            if (isChecked === !!prev[id]) return prev;
            const next = { ...prev };
            if (isChecked) {
              next[id] = true;
            } else {
              delete next[id];
            }
            return next;
          })
        }
      />
    </div>
  );
};

const PropertiesHeaderCheckboxCell = ({ ids }: { ids: string[] }) => {
  const [selectedFieldIds, setSelectedFieldIds] = useAtom(
    selectedFieldIdsState,
  );
  const allSelected = ids.length > 0 && ids.every((id) => selectedFieldIds[id]);
  const someSelected = ids.some((id) => selectedFieldIds[id]);

  return (
    <div className="flex items-center justify-center h-8">
      <Checkbox
        checked={allSelected || (someSelected && 'indeterminate')}
        onCheckedChange={(value) =>
          setSelectedFieldIds((prev) => {
            const isChecked = !!value;
            const next = { ...prev };
            ids.forEach((id) => {
              if (isChecked) {
                next[id] = true;
              } else {
                delete next[id];
              }
            });
            return next;
          })
        }
      />
    </div>
  );
};

const buildCheckboxColumn = (ids: string[]): ColumnDef<IField> => ({
  id: 'checkbox',
  accessorKey: 'checkbox',
  header: () => <PropertiesHeaderCheckboxCell ids={ids} />,
  cell: ({ row }) => <PropertiesCheckboxCell id={row.original._id} />,
  size: 33,
});

const PropertiesMoreColumnCell = ({
  cell,
  contentType,
}: {
  cell: Cell<IField, unknown>;
  contentType: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { _id, groupId } = cell.row.original;
  const { confirm } = useConfirm();
  const { removeField, loading } = useFieldRemove();
  const setSelectedFieldIds = useSetAtom(selectedFieldIdsState);

  const handleDelete = () => {
    confirm({
      message: t(
        'confirm-delete-field',
        'Are you sure you want to delete this field?',
      ),
    }).then(() => {
      removeField({ variables: { id: _id } });
      setSelectedFieldIds((prev) => {
        if (!prev[_id]) return prev;
        const next = { ...prev };
        delete next[_id];
        return next;
      });
    });
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <Can action="fieldsManage">
          <DropdownMenu.Trigger asChild>
            <RecordTable.MoreButton />
          </DropdownMenu.Trigger>
        </Can>
        <DropdownMenu.Content className="min-w-48">
          <Can action="fieldsManage">
            <DropdownMenu.Item asChild>
              <Link
                to={`/settings/properties/${contentType}/${groupId}/${_id}`}
              >
                <IconEdit />
                {t('edit', 'Edit')}
              </Link>
            </DropdownMenu.Item>
          </Can>
          <Can action="fieldsManage">
            <DropdownMenu.Item
              className="text-destructive"
              disabled={loading}
              onClick={handleDelete}
            >
              {loading ? <Spinner size="sm" /> : <IconTrash />}
              {t('delete', 'Delete')}
            </DropdownMenu.Item>
          </Can>
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
};

const PropertyToggleCell = ({
  cell,
  toggleKey,
  label,
}: {
  cell: Cell<IField, unknown>;
  toggleKey: 'isVisible' | 'isVisibleToCreate' | 'isRequired';
  label: string;
}) => {
  const { editProperty } = useEditProperty();
  const { _id } = cell.row.original;
  const checked = Boolean(cell.getValue());

  return (
    <RecordTableInlineCell>
      <div
        className="flex items-center justify-center w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <Switch
          size="sm"
          aria-label={label}
          checked={checked}
          onCheckedChange={(value) =>
            editProperty({ variables: { id: _id, [toggleKey]: value } })
          }
        />
      </div>
    </RecordTableInlineCell>
  );
};

const buildGroupColumn = (
  t: TFunction,
  groupNameById: Record<string, string>,
): ColumnDef<IField> => ({
  id: 'group',
  accessorKey: 'groupId',
  header: () => <RecordTable.InlineHead label={t('group', 'Group')} />,
  cell: ({ cell }) => {
    const { groupId } = cell.row.original;
    return (
      <RecordTableInlineCell>
        <span className="truncate text-muted-foreground">
          {(groupId && groupNameById[groupId]) || '—'}
        </span>
      </RecordTableInlineCell>
    );
  },
  size: 160,
});

export const propertiesColumns = (
  t: TFunction,
  {
    groupNameById,
    contentType,
    fieldIds,
  }: {
    groupNameById?: Record<string, string>;
    contentType: string;
    fieldIds: string[];
  },
): ColumnDef<IField>[] => [
  buildCheckboxColumn(fieldIds),
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label={t('name', 'Name')} />,
    cell: ({ cell }) => {
      const { name, icon } = cell.row.original;
      return (
        <RecordTableInlineCell>
          <div className="flex items-center gap-2 overflow-hidden">
            <IconComponent
              className="h-4 w-4 text-muted-foreground"
              name={icon}
            />
            <span className="truncate">{name}</span>
          </div>
        </RecordTableInlineCell>
      );
    },
    size: 220,
  },
  {
    id: 'dataType',
    accessorKey: 'type',
    header: () => (
      <RecordTable.InlineHead label={t('data-type', 'Data type')} />
    ),
    cell: ({ cell }) => {
      const { type, relationType } = cell.row.original;
      const fieldTypeObject = FIELD_TYPES_OBJECT[type || ''];
      const Icon = fieldTypeObject?.icon;

      return (
        <RecordTableInlineCell>
          <div className="flex items-center gap-2 text-muted-foreground overflow-hidden">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            <span className="truncate">
              {fieldTypeObject &&
                t(`field-type.${fieldTypeObject.value}`, fieldTypeObject.label)}
              {type === 'relation' &&
                relationType &&
                ` (${t(
                  `content-type.${relationType.replace(':', '-')}`,
                  CORE_RELATION_TYPES.find((rt) => rt.value === relationType)
                    ?.label || relationType,
                )})`}
            </span>
          </div>
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  ...(groupNameById ? [buildGroupColumn(t, groupNameById)] : []),
  {
    id: 'isVisible',
    accessorKey: 'isVisible',
    header: () => <RecordTable.InlineHead label={t('visible', 'Visible')} />,
    cell: ({ cell }) => (
      <PropertyToggleCell
        cell={cell}
        toggleKey="isVisible"
        label={t('visible', 'Visible')}
      />
    ),
    size: 90,
  },
  {
    id: 'isVisibleToCreate',
    accessorKey: 'isVisibleToCreate',
    header: () => (
      <RecordTable.InlineHead
        label={t('visible-to-create', 'Visible to create')}
      />
    ),
    cell: ({ cell }) => (
      <PropertyToggleCell
        cell={cell}
        toggleKey="isVisibleToCreate"
        label={t('visible-to-create', 'Visible to create')}
      />
    ),
    size: 140,
  },
  {
    id: 'isRequired',
    accessorKey: 'isRequired',
    header: () => <RecordTable.InlineHead label={t('required', 'Required')} />,
    cell: ({ cell }) => (
      <PropertyToggleCell
        cell={cell}
        toggleKey="isRequired"
        label={t('required', 'Required')}
      />
    ),
    size: 100,
  },
  {
    id: 'logic',
    accessorKey: 'logics',
    header: () => <RecordTable.InlineHead label={t('logic', 'Logic')} />,
    cell: ({ cell }) => {
      const logics = cell.row.original.logics;
      const ruleCount = Array.isArray(logics) ? logics.length : 0;
      return (
        <RecordTableInlineCell>
          {ruleCount > 0 ? (
            <Badge variant="secondary">
              {t(
                'logic-rule-count',
                ruleCount === 1 ? '{{count}} rule' : '{{count}} rules',
                { count: ruleCount },
              )}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </RecordTableInlineCell>
      );
    },
    size: 110,
  },
  {
    id: 'more',
    cell: ({ cell }) => (
      <PropertiesMoreColumnCell cell={cell} contentType={contentType} />
    ),
    size: 33,
  },
];
