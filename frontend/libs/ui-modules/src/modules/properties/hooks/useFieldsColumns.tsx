import {
  IconComponent,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { IField } from '../types/fieldsTypes';
import { Cell, ColumnDef } from '@tanstack/react-table';

export const useFieldsColumns = ({
  fields,
}: {
  fields: IField[];
}): ColumnDef<unknown>[] =>
  fields.map((field) => ({
    id: field.code,
    header: () => (
      <RecordTable.InlineHead
        label={field.name}
        icon={() => <IconComponent name={field.icon} className="size-4" />}
      />
    ),
    cell: ({
      cell,
    }: {
      cell: Cell<
        { customFieldsData?: Array<{ field: string; value?: string }> },
        string
      >;
    }) => {
      const customFieldsData = cell.row.original?.customFieldsData as
        | Array<{ field: string; value?: string }>
        | undefined;
      const matchedField = customFieldsData?.find(
        (data) => data.field === field._id,
      );
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={matchedField?.value || ''} />
        </RecordTableInlineCell>
      );
    },
    size: 200,
  })) as ColumnDef<unknown>[];
