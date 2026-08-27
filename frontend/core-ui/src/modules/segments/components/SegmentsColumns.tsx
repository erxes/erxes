import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  Input,
  RecordTable,
  RecordTableInlineCell,
  Popover,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { ISegment } from 'ui-modules';
import { segmentMoreColumn } from './SegmentsMoreColumn';

const columns: (t: (key: string) => string) => ColumnDef<ISegment>[] = (t) => [
  segmentMoreColumn,
  {
    ...RecordTable.checkboxColumn,
    size: 33,
  } as ColumnDef<ISegment>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label={t('name')} />,
    cell: ({ cell }) => {
      const [, setSegmentId] = useQueryState('segmentId');
      const { name } = cell.row.original;
      const [open, setOpen] = useState<boolean>(false);
      const [_name, setName] = useState<string>(name);

      const onSave = () => {
        // TODO: Implement segment name update
      };

      const onChange = (el: React.ChangeEvent<HTMLInputElement>) => {
        setName(el.currentTarget.value);
      };

      return (
        <Popover
          open={open}
          onOpenChange={(open) => {
            setOpen(open);
            if (!open) {
              onSave();
            }
          }}
        >
          <div className="pl-2">
            <RecordTableInlineCell.Trigger>
              <Badge
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  setSegmentId(cell.row.original._id);
                }}
              >
                {cell.getValue() as string}
              </Badge>
            </RecordTableInlineCell.Trigger>
          </div>
          <RecordTableInlineCell.Content className="min-w-72">
            <Input value={_name} onChange={onChange} />
          </RecordTableInlineCell.Content>
        </Popover>
      );
    },
  },

  {
    id: 'description',
    accessorKey: 'description',
    header: () => <RecordTable.InlineHead label={t('description')} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'count',
    accessorKey: 'count',
    header: () => <RecordTable.InlineHead label={t('count')} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
  },
];

export default columns;
