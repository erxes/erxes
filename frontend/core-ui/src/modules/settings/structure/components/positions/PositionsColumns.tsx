import { ColumnDef } from '@tanstack/table-core';
import { IPositionListItem } from '../../types/position';
import {
  Badge,
  Input,
  RecordTable,
  RecordTableInlineCell,
  Popover,
  RecordTableTree,
  TextOverflowTooltip,
} from 'erxes-ui';
import { IconHash } from '@tabler/icons-react';
import { SelectPositions } from 'ui-modules';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { usePositionInlineEdit } from '../../hooks/usePositionActions';
import { useState } from 'react';
import clsx from 'clsx';
import { PositionsMoreColumn } from './PositionsMoreColumn';

export const PositionsColumns: ColumnDef<IPositionListItem>[] = [
  PositionsMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IPositionListItem>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconHash} label="code" />,
    cell: ({ cell }) => {
      const { _id, code } = cell.row.original || {};
      const { positionsEdit, loading } = usePositionInlineEdit();
      const [_code, setCode] = useState<string>(code || '');
      const [open, setOpen] = useState<boolean>(false);
      const onSave = () => {
        if (code !== _code) {
          positionsEdit(
            {
              variables: {
                id: _id,
                code: _code,
              },
            },
            ['code'],
          );
        }
      };

      const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.currentTarget;
        setCode(value);
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
          <RecordTableInlineCell.Trigger>
            <RecordTableTree.Trigger
              order={cell.row.original.order}
              name={cell.getValue() as string}
              hasChildren={cell.row.original.hasChildren}
            >
              {cell.getValue() as string}
            </RecordTableTree.Trigger>
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content>
            <Input value={_code} onChange={onChange} disabled={loading} />
          </RecordTableInlineCell.Content>
        </Popover>
      );
    },
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead label="title" />,
    cell: ({ cell }) => {
      const { _id, code, title } = cell.row.original || {};
      const { positionsEdit, loading } = usePositionInlineEdit();
      const [_title, setTitle] = useState<string>(title || '');
      const [open, setOpen] = useState<boolean>(false);
      const onSave = () => {
        if (title !== _title) {
          positionsEdit(
            {
              variables: {
                id: _id,
                title: _title,
                code: code,
              },
            },
            ['title', 'code'],
          );
        }
      };
      const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.currentTarget;
        setTitle(value);
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
          <RecordTableInlineCell.Trigger>
            <TextOverflowTooltip value={cell.getValue() as string} />
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content>
            <Input value={_title} onChange={onChange} disabled={loading} />
          </RecordTableInlineCell.Content>
        </Popover>
      );
    },
    size: 250,
  },
  {
    id: 'parentId',
    accessorKey: 'parentId',
    header: () => <RecordTable.InlineHead label="parent" />,
    cell: ({ cell }) => {
      const { _id, code } = cell.row.original || {};
      const { positionsEdit } = usePositionInlineEdit();
      return (
        <SelectPositions.InlineCell
          scope={clsx(SettingsHotKeyScope.PositionsPage, _id, 'parentId')}
          mode="single"
          value={cell.getValue() as string[]}
          onValueChange={(value) =>
            positionsEdit(
              {
                variables: {
                  id: _id,
                  parentId: value,
                  code: code,
                },
              },
              ['parentId', 'code'],
            )
          }
        />
      );
    },
    size: 250,
  },
  {
    id: 'userCount',
    accessorKey: 'userCount',
    header: () => <RecordTable.InlineHead label="team member count" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell className="justify-center">
          <Badge variant={'secondary'}>{cell.getValue() as number}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
];
