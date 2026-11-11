import type { CustomValue, Field } from '@erxes/core-contract';
import type { ColumnDef } from '@tanstack/react-table';
import { RecordTable } from 'erxes-ui';
import { CustomFieldCell } from './CustomFieldCell';
import { fieldTypeOf } from './fieldTypes';

type WithCustomFields = { id: string; customFields: Record<string, CustomValue> };

/** Table columns for custom fields; `save` stores a record's changed values. */
export const customFieldColumns = <Row extends WithCustomFields>(
  fields: Field[],
  save: (id: string, patch: Record<string, CustomValue | null>) => void,
  scope: string,
): ColumnDef<Row>[] =>
  fields.map((field) => ({
    id: `field:${field.id}`,
    accessorFn: (row) => row.customFields[field.id],
    header: () => (
      <RecordTable.InlineHead icon={fieldTypeOf(field.type)?.icon} label={field.label} />
    ),
    cell: ({ row }) => (
      <CustomFieldCell
        field={field}
        scope={`${scope}.${row.original.id}.${field.id}`}
        value={row.original.customFields[field.id]}
        onSave={(value) => save(row.original.id, { [field.id]: value })}
      />
    ),
    size: field.type === 'textarea' ? 280 : 180,
  }));
