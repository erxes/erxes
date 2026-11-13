import type { CustomValue, Field } from '@erxes/core-contract';
import type { RecordTableColumnDef } from 'erxes-ui';
import { RecordTable } from 'erxes-ui';
import type { ReactNode } from 'react';
import { FIELD_TYPES_OBJECT } from './fieldTypes';

type WithCustomFields = { id: string; customFields: Record<string, CustomValue> };

/** Table columns for custom fields; `renderCell` draws a record's value of one. */
export const customFieldColumns = <Row extends WithCustomFields>(
  fields: Field[],
  renderCell: (row: Row, field: Field) => ReactNode,
): RecordTableColumnDef<Row>[] =>
  fields.map((field) => ({
    id: `field:${field.id}`,
    accessorFn: (row) => row.customFields[field.id],
    header: () => (
      <RecordTable.InlineHead icon={FIELD_TYPES_OBJECT[field.type].icon} label={field.label} />
    ),
    cell: ({ row }) => renderCell(row.original, field),
    size: field.type === 'textarea' ? 280 : 180,
  }));
