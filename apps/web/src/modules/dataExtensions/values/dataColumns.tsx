import type { DataExtensionField } from '@erxes/core-contract';
import { DataExtensionValues } from '@erxes/core-contract/dataExtensionValues';
import { memberQueries } from '@erxes/core-contract/client';
import {
  MemberInline,
  RecordTable,
  type RecordTableColumnDef,
  RecordTableInlineCell,
} from 'erxes-ui';
import { FIELD_TYPES } from '../fieldTypes';
import { useValueText } from '../form/valueText';
import type { Value } from '../values';

/** One field's value in a list's cell, as text (a member by name). */
export const DataValueCell = ({
  field,
  value,
}: {
  field: DataExtensionField;
  value: Value | undefined;
}) => {
  const text = useValueText();

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

/** A row of a core record list (customers, companies). */
interface ListRow {
  id: string;
}

/** A list row's Data Extensions values: lists of core records answer with them. */
const valuesIn = (row: ListRow): DataExtensionValues =>
  ('values' in row ? DataExtensionValues.safeParse(row.values).data : undefined) ?? {};

/**
 * A core list's columns for its Data Extensions fields (customers, companies), by the path its
 * sort and saved views name them: `data.<key>`. Hidden fields are left out.
 */
export const dataFieldColumns = <Row extends ListRow>(
  fields: DataExtensionField[],
): RecordTableColumnDef<Row>[] =>
  fields
    .filter((field) => field.status === 'active' && !field.settings.hidden)
    .map((field) => ({
      id: `data.${field.key}`,
      accessorFn: (row) => valuesIn(row)[field.key],
      header: () => (
        <RecordTable.InlineHead icon={FIELD_TYPES[field.type].icon} label={field.label} />
      ),
      cell: ({ row }) => <DataValueCell field={field} value={valuesIn(row.original)[field.key]} />,
      size: field.type === 'longText' ? 280 : 180,
    }));
