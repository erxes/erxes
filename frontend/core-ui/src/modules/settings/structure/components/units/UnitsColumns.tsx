import { useState } from 'react';
import { ColumnDef } from '@tanstack/table-core';
import { IconHash } from '@tabler/icons-react';
import {
  Badge,
  Input,
  RecordTable,
  RecordTableInlineCell,
  Popover,
  TextOverflowTooltip,
} from 'erxes-ui';
import { SelectDepartments, SelectMember } from 'ui-modules';
import { IUnitListItem } from '../../types/unit';
import { useUnitInlineEdit } from '../../hooks/useUnitActions';
import { UnitsMoreColumn } from './UnitsMoreColumn';

export const UnitsColumns: ColumnDef<IUnitListItem>[] = [
  UnitsMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IUnitListItem>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconHash} label="code" />,
    cell: ({ cell }) => {
      const { unitsEdit, loading } = useUnitInlineEdit();
      const { _id, code } = cell.row.original;
      const [open, setOpen] = useState<boolean>(false);
      const [_code, setCode] = useState<string>(code || '');

      const onSave = () => {
        if (_code !== code) {
          unitsEdit(
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

      const onChange = (el: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = el.currentTarget;
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
            {cell.getValue() as string}
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
      const { unitsEdit, loading } = useUnitInlineEdit();
      const { _id, title, code } = cell.row.original;
      const [open, setOpen] = useState<boolean>(false);
      const [_title, setTitle] = useState<string>(title || '');
      const onSave = () => {
        if (_title !== title) {
          unitsEdit(
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
      const onChange = (el: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = el.currentTarget;
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
    size: 300,
  },
  {
    id: 'supervisorId',
    accessorKey: 'supervisorId',
    header: () => <RecordTable.InlineHead label="supervisor" />,
    cell: ({ cell }) => {
      const { _id, code } = cell.row.original;
      const { unitsEdit } = useUnitInlineEdit();
      return (
        <RecordTableInlineCell>
          <SelectMember.InlineCell
            mode="single"
            value={cell.getValue() as string}
            onValueChange={(value) => {
              unitsEdit(
                {
                  variables: {
                    id: _id,
                    supervisorId: value,
                    code,
                  },
                },
                ['supervisorId', 'code'],
              );
            }}
            scope={`UnitsPage.${_id}.Supervisor`}
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'departmentId',
    accessorKey: 'departmentId',
    header: () => <RecordTable.InlineHead label="department" />,
    cell: ({ cell }) => {
      const { _id, code } = cell.row.original;
      const { unitsEdit } = useUnitInlineEdit();
      return (
        <SelectDepartments.InlineCell
          mode="single"
          value={cell.getValue() as string}
          onValueChange={(value) => {
            unitsEdit(
              {
                variables: {
                  id: _id,
                  departmentId: value,
                  code,
                },
              },
              ['departmentId', 'code'],
            );
          }}
        />
      );
    },
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
