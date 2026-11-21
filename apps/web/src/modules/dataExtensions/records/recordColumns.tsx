import type { DataExtensionField, DataExtensionRecord } from '@erxes/core-contract';
import { IconClock } from '@tabler/icons-react';
import { RecordTable, type RecordTableColumnDef, RecordTableInlineCell, useFormat } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { FIELD_TYPES } from '../fieldTypes';
import { DataValueCell } from '../values/dataColumns';

/** The record's label field: its name, linking to its page. */
const LabelCell = ({ objectKey, record }: { objectKey: string; record: DataExtensionRecord }) => {
  const { t } = useTranslation('data', { keyPrefix: 'records' });

  return (
    <RecordTableInlineCell>
      <Link
        to={paths.objects.record(objectKey, record.id)}
        className="truncate font-medium hover:underline"
      >
        {record.label || t('untitled', 'Untitled')}
      </Link>
    </RecordTableInlineCell>
  );
};

const UpdatedCell = ({ record }: { record: DataExtensionRecord }) => {
  const format = useFormat();

  return (
    <RecordTableInlineCell>
      <span className="truncate text-muted-foreground">{format.dateTime(record.updatedAt)}</span>
    </RecordTableInlineCell>
  );
};

/** A column per field, the label field first and linking to the record, then when it changed. */
export const useRecordColumns = (
  objectKey: string,
  fields: DataExtensionField[],
  labelFieldId: string | null,
): RecordTableColumnDef<DataExtensionRecord>[] => {
  const { t } = useTranslation('data', { keyPrefix: 'records' });

  return useMemo(() => {
    const ordered = [
      ...fields.filter((field) => field.id === labelFieldId),
      ...fields.filter((field) => field.id !== labelFieldId),
    ];

    return [
      ...ordered.map((field): RecordTableColumnDef<DataExtensionRecord> => ({
        id: field.key,
        header: () => (
          <RecordTable.InlineHead icon={FIELD_TYPES[field.type].icon} label={field.label} />
        ),
        cell: ({ row }) =>
          field.id === labelFieldId ? (
            <LabelCell objectKey={objectKey} record={row.original} />
          ) : (
            <DataValueCell field={field} value={row.original.values[field.key]} />
          ),
        size: field.id === labelFieldId ? 240 : 180,
      })),
      {
        id: 'updatedAt',
        header: () => <RecordTable.InlineHead icon={IconClock} label={t('updated', 'Updated')} />,
        cell: ({ row }) => <UpdatedCell record={row.original} />,
        size: 180,
      },
    ];
  }, [fields, labelFieldId, objectKey, t]);
};
