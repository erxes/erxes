import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  Input,
  RecordTable,
  RecordTableInlineCell,
  Popover,
  RecordTableTree,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { ISegment } from 'ui-modules';
import { segmentMoreColumn } from './SegmentsMoreColumn';

const columns: (
  t: (key: string) => string,
) => ColumnDef<{ order: string; hasChildren: boolean } & ISegment>[] = (t) => [
  segmentMoreColumn,
  {
    ...RecordTable.checkboxColumn,
    size: 20,
  } as ColumnDef<{ order: string; hasChildren: boolean } & ISegment>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label={t('name')} />,
    cell: ({ cell }) => {
      const [, setSegmentId] = useQueryState('segmentId');
      const { _id, name } = cell.row.original;
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
          <RecordTableTree.Trigger
            order={cell.row.original.order}
            name={cell.getValue() as string}
            hasChildren={cell.row.original.hasChildren}
            className="pl-2"
          >
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
          </RecordTableTree.Trigger>
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
