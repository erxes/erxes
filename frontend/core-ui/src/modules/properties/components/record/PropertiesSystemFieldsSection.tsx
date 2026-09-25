import type { ColumnDef } from '@tanstack/react-table';
import { IconLock } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Collapsible,
  RecordTable,
  RecordTableInlineCell,
  Spinner,
  Switch,
  Tooltip,
} from 'erxes-ui';
import type { TFunction } from 'i18next';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';
import { FIELD_TYPES_OBJECT } from '../../constants/fieldTypes';
import { useEditPropertySystemField } from '../../hooks/useEditPropertySystemField';
import { usePropertySystemFields } from '../../hooks/usePropertySystemFields';
import { IPropertySystemField } from '../../types/Properties';
import { PropertySystemFieldLogicSheet } from '../PropertySystemFieldLogicSheet';

type TSystemFieldRow = IPropertySystemField & { _id: string };

type TSystemFieldToggleKey = 'isVisible' | 'isVisibleToCreate' | 'isRequired';

const SystemFieldToggleCell = ({
  field,
  contentType,
  toggleKey,
  label,
}: {
  field: TSystemFieldRow;
  contentType: string;
  toggleKey: TSystemFieldToggleKey;
  label: string;
}) => {
  const checked = field[toggleKey];
  const { editSystemField, loading } = useEditPropertySystemField(contentType);

  return (
    <RecordTableInlineCell>
      <div className="flex w-full items-center justify-center">
        <Can
          action="fieldsManage"
          fallback={
            <Switch size="sm" aria-label={label} checked={checked} disabled />
          }
        >
          <Switch
            size="sm"
            aria-label={label}
            checked={checked}
            disabled={loading}
            onCheckedChange={(value) =>
              editSystemField(field.code, { [toggleKey]: value })
            }
          />
        </Can>
      </div>
    </RecordTableInlineCell>
  );
};

const SystemFieldLogicCell = ({
  field,
  onOpen,
}: {
  field: TSystemFieldRow;
  onOpen: (field: TSystemFieldRow) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const ruleCount = field.logics?.length ?? 0;

  const summary =
    ruleCount > 0 ? (
      <Badge variant="secondary">
        {t(
          'logic-rule-count',
          ruleCount === 1 ? '{{count}} rule' : '{{count}} rules',
          { count: ruleCount },
        )}
      </Badge>
    ) : (
      <span className="text-muted-foreground">—</span>
    );

  return (
    <RecordTableInlineCell>
      <Can action="fieldsManage" fallback={summary}>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => onOpen(field)}
        >
          {summary}
        </Button>
      </Can>
    </RecordTableInlineCell>
  );
};

const systemFieldColumns = (
  t: TFunction,
  contentType: string,
  onOpenLogic: (field: TSystemFieldRow) => void,
): ColumnDef<TSystemFieldRow>[] => {
  const toggleColumn = (
    toggleKey: TSystemFieldToggleKey,
    label: string,
    size: number,
  ): ColumnDef<TSystemFieldRow> => ({
    id: toggleKey,
    accessorKey: toggleKey,
    header: () => <RecordTable.InlineHead label={label} />,
    cell: ({ cell }) => (
      <SystemFieldToggleCell
        field={cell.row.original}
        contentType={contentType}
        toggleKey={toggleKey}
        label={label}
      />
    ),
    size,
  });

  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: () => <RecordTable.InlineHead label={t('name', 'Name')} />,
      cell: ({ cell }) => {
        const { name, code } = cell.row.original;

        return (
          <RecordTableInlineCell>
            <div className="flex min-w-0 items-center gap-2">
              <IconLock className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{name}</span>
              <span className="truncate font-mono text-xs text-muted-foreground">
                {code}
              </span>
            </div>
          </RecordTableInlineCell>
        );
      },
      size: 260,
    },
    {
      id: 'dataType',
      accessorKey: 'type',
      header: () => (
        <RecordTable.InlineHead label={t('data-type', 'Data type')} />
      ),
      cell: ({ cell }) => {
        const fieldType = FIELD_TYPES_OBJECT[cell.row.original.type];
        const Icon = fieldType?.icon;

        return (
          <RecordTableInlineCell>
            <div className="flex items-center gap-2 overflow-hidden text-muted-foreground">
              {Icon && <Icon className="size-4 shrink-0" />}
              <span className="truncate">
                {fieldType
                  ? t(`field-type.${fieldType.value}`, fieldType.label)
                  : cell.row.original.type}
              </span>
            </div>
          </RecordTableInlineCell>
        );
      },
      size: 160,
    },
    toggleColumn('isVisible', t('visible', 'Visible'), 90),
    toggleColumn(
      'isVisibleToCreate',
      t('visible-to-create', 'Visible to create'),
      140,
    ),
    toggleColumn('isRequired', t('required', 'Required'), 100),
    {
      id: 'logic',
      accessorKey: 'logics',
      header: () => <RecordTable.InlineHead label={t('logic', 'Logic')} />,
      cell: ({ cell }) => (
        <SystemFieldLogicCell field={cell.row.original} onOpen={onOpenLogic} />
      ),
      size: 110,
    },
  ];
};

export const PropertiesSystemFieldsSection = ({
  contentType,
}: {
  contentType: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { systemFields, loading } = usePropertySystemFields(contentType);
  const [logicCode, setLogicCode] = useState<string | null>(null);

  const columns = useMemo(
    () =>
      systemFieldColumns(t, contentType, (field) => setLogicCode(field.code)),
    [t, contentType],
  );

  const rows = useMemo<TSystemFieldRow[]>(
    () => systemFields.map((field) => ({ ...field, _id: field.code })),
    [systemFields],
  );

  const logicField = rows.find((row) => row.code === logicCode) ?? null;

  if (loading) {
    return <Spinner containerClassName="py-6" />;
  }

  if (!rows.length) {
    return null;
  }

  return (
    <Collapsible defaultOpen className="group">
      <div className="flex items-center gap-1">
        <span className="size-7 shrink-0" />
        <Collapsible.Trigger asChild>
          <Button
            variant="secondary"
            className="w-full justify-start font-medium"
          >
            <Collapsible.TriggerIcon />
            {t('basic-information', 'Basic information')}
            <Badge variant="secondary" className="ml-1">
              {rows.length}
            </Badge>
          </Button>
        </Collapsible.Trigger>
        <Tooltip.Provider>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <span className="flex size-7 shrink-0 items-center justify-center text-muted-foreground">
                <IconLock className="size-4" />
              </span>
            </Tooltip.Trigger>
            <Tooltip.Content>
              {t(
                'system-fields-hint',
                'Defined by the system. Only its settings can be changed.',
              )}
            </Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>
      </div>
      <Collapsible.Content className="pt-2">
        <RecordTable.Provider
          columns={columns}
          data={rows}
          stickyColumns={['name']}
          className="rounded-md border"
        >
          <RecordTable.Scroll className="h-auto" viewportClassName="max-h-96">
            <RecordTable>
              <RecordTable.Header />
              <RecordTable.Body>
                <RecordTable.RowList />
              </RecordTable.Body>
            </RecordTable>
          </RecordTable.Scroll>
        </RecordTable.Provider>
      </Collapsible.Content>
      <PropertySystemFieldLogicSheet
        field={logicField}
        contentType={contentType}
        onClose={() => setLogicCode(null)}
      />
    </Collapsible>
  );
};
