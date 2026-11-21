import type { DataExtensionField, DataExtensionRecord } from '@erxes/core-contract';
import { memberQueries } from '@erxes/core-contract/client';
import { IconClock } from '@tabler/icons-react';
import {
  MemberInline,
  RecordTable,
  type RecordTableColumnDef,
  RecordTableInlineCell,
  useFormat,
} from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { FIELD_TYPES } from '../fieldTypes';
import { useValueText } from '../form/valueText';

const ValueCell = ({
  field,
  record,
}: {
  field: DataExtensionField;
  record: DataExtensionRecord;
}) => {
  const text = useValueText();
  const value = record.values[field.key];

  if (field.type === 'member' && typeof value === 'string') {
    return (
      <RecordTableInlineCell>
        <MemberInline memberId={value} members={memberQueries} />
      </RecordTableInlineCell>
    );
  }

  return (
    <RecordTableInlineCell>
      <span className="truncate">{text(field, value)}</span>
    </RecordTableInlineCell>
  );
};

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
            <ValueCell field={field} record={row.original} />
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
