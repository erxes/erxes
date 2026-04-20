import { IconHash } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  Input,
  RecordTable,
  RecordTableInlineCell,
  Popover,
  RecordTableTree,
  TextOverflowTooltip,
} from 'erxes-ui';
import { IDepartmentListItem } from '../../types/department';
import { SelectMember } from 'ui-modules';
import { useDepartmentInlineEdit } from '../../hooks/useDepartmentActions';
import { useState } from 'react';
import { DepartmentsMoreColumn } from './DepartmentsMoreColumn';

export const DepartmentColumns: ColumnDef<IDepartmentListItem>[] = [
  DepartmentsMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IDepartmentListItem>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconHash} label="code" />,
    cell: ({ cell }) => {
      const { departmentsEdit, loading } = useDepartmentInlineEdit();
      const { _id, code } = cell.row.original;
      const [_code, setCode] = useState<string>(code);
      const [open, setOpen] = useState<boolean>(false);

      const onSave = () => {
        if (_code !== code) {
          departmentsEdit({ variables: { id: _id, code: _code } }, ['code']);
        }
      };

      const onChange = (el: React.ChangeEvent<HTMLInputElement>) => {
        setCode(el.currentTarget.value);
      };

      return (
        <Popover
          open={open}
          onOpenChange={(open) => {
            setOpen(open);
            if (!open) onSave();
          }}
        >
          <RecordTableInlineCell.Trigger>
            <RecordTableTree.Trigger
              order={(cell.row.original?.order as string) || ''}
              name={cell.getValue() as string}
              hasChildren={cell.row.original.hasChildren as boolean}
            >
              <TextOverflowTooltip value={cell.getValue() as string} />
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
      const { departmentsEdit, loading } = useDepartmentInlineEdit();
      const { _id, code, title } = cell.row.original;
      const [_title, setTitle] = useState<string>(title);
      const [open, setOpen] = useState<boolean>(false);

      const onSave = () => {
        if (_title !== title) {
          departmentsEdit({ variables: { id: _id, title: _title, code } }, [
            'title',
            'code',
          ]);
        }
      };

      const onChange = (el: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(el.currentTarget.value);
      };

      return (
        <Popover
          open={open}
          onOpenChange={(open) => {
            setOpen(open);
            if (!open) onSave();
          }}
        >
          <RecordTableInlineCell.Trigger>
            {cell.getValue() as string}
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content>
            <Input value={_title} onChange={onChange} disabled={loading} />
          </RecordTableInlineCell.Content>
        </Popover>
      );
    },
    size: 350,
  },
  {
    id: 'supervisorId',
    accessorKey: 'supervisorId',
    header: () => <RecordTable.InlineHead label="supervisor" />,
    cell: ({ cell }) => {
      const { _id, code } = cell.row.original;
      const { departmentsEdit } = useDepartmentInlineEdit();
      return (
        <RecordTableInlineCell>
          <SelectMember.InlineCell
            scope={`DepartmentsPage.${_id}`}
            value={cell.getValue() as string}
            mode="single"
            onValueChange={(value) => {
              departmentsEdit(
                {
                  variables: { id: _id, supervisorId: value, code },
                },
                ['supervisorId', 'code'],
              );
            }}
          />
        </RecordTableInlineCell>
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
