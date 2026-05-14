import { ColumnDef, Row } from '@tanstack/react-table';
import { IconComponent, RecordTable } from 'erxes-ui';
import { Field } from '../components/Field';
import { FieldColumnProps } from '../types/fieldsTypes';

export const useFieldsColumns = ({
  fields,
  mutateHook,
}: FieldColumnProps): ColumnDef<unknown>[] =>
  fields
    .filter((field) => field?.type && !['check', 'radio'].includes(field.type))
    .map((field) => ({
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
            propertiesData?: Record<string, unknown>;
            _id: string;
          } & Record<string, unknown>
        >;
      }) => {
        return (
          <Field
            field={field}
            value={row.original.propertiesData?.[field._id]}
            propertiesData={row.original.propertiesData}
            id={row.original._id}
            mutateHook={mutateHook}
            inCell
          />
        );
      },
      size: 200,
    })) as ColumnDef<unknown>[];
