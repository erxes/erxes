import type { CustomValue, Field } from '@erxes/core-contract';
import type { ColumnDef } from '@tanstack/react-table';
import { RecordTable } from 'erxes-ui';
import { CustomFieldCell } from './CustomFieldCell';
import { FIELD_TYPES_OBJECT } from './fieldTypes';

type WithCustomFields = { id: string; customFields: Record<string, CustomValue> };

/**
 * Table columns for custom fields; `useSave` returns the record's save
 * function (a hook, so cells can use their mutation).
 */
export const customFieldColumns = <Row extends WithCustomFields>(
  fields: Field[],
  useSave: () => (id: string, patch: Record<string, CustomValue | null>) => void,
  scope: string,
): ColumnDef<Row>[] =>
  fields.map((field) => ({
    id: `field:${field.id}`,
    accessorFn: (row) => row.customFields[field.id],
    header: () => (
      <RecordTable.InlineHead icon={FIELD_TYPES_OBJECT[field.type].icon} label={field.label} />
    ),
    cell: function Cell({ row }) {
      const save = useSave();

      return (
        <CustomFieldCell
          field={field}
          scope={`${scope}.${row.original.id}.${field.id}`}
          value={row.original.customFields[field.id]}
          onSave={(value) => save(row.original.id, { [field.id]: value })}
        />
      );
    },
    size: field.type === 'textarea' ? 280 : 180,
  }));
