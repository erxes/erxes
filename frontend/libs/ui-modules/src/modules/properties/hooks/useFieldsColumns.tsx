import { IconComponent, RecordTable } from 'erxes-ui';
import { FieldColumnProps } from '../types/fieldsTypes';
import { ColumnDef, Row } from '@tanstack/react-table';
import { MemoizedFieldCell } from '../components/FieldCell';

export const useFieldsColumns = ({
  fields,
  mutateHook,
}: FieldColumnProps): ColumnDef<unknown>[] =>
  fields.map((field) => ({
    id: field._id,
    header: () => (
      <RecordTable.InlineHead
        label={field.name}
        icon={() => <IconComponent name={field.icon} className="size-4" />}
      />
    ),
    cell: ({
      row,
    }: {
      row: Row<
        {
          customFieldsData?: Record<string, unknown>;
          _id: string;
        } & Record<string, unknown>
      >;
    }) => {
      return (
        <MemoizedFieldCell
          field={field}
          value={row.original.customFieldsData?.[field._id] as string}
          customFieldsData={row.original.customFieldsData}
          id={row.original._id}
          mutateHook={mutateHook}
        />
      );
    },
    size: 200,
  })) as ColumnDef<unknown>[];
