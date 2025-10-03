import { IconClock, IconEdit, IconHash, IconTrash } from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  Button,
  Input,
  RecordTable,
  RecordTableInlineCell,
  Popover,
  RecordTableTree,
  Spinner,
  TextOverflowTooltip,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { IDepartmentListItem } from '../../types/department';
import { useSetAtom } from 'jotai';
import { renderingDepartmentDetailAtom } from '../../states/renderingDepartmentDetail';
import { SelectMember } from 'ui-modules';
import {
  useDepartmentInlineEdit,
  useRemoveDepartment,
} from '../../hooks/useDepartmentActions';
import { useState } from 'react';

export const DepartmentWorkingHoursColumnCell = ({
  cell,
}: {
  cell: Cell<IDepartmentListItem, unknown>;
}) => {
  const [, setOpen] = useQueryState('workingHoursId');
  const setRenderingDepartmentDetail = useSetAtom(
    renderingDepartmentDetailAtom,
  );
  const { _id } = cell.row.original;
  return (
    <Button
      onClick={() => {
        setOpen(_id);
        setRenderingDepartmentDetail(false);
      }}
      variant={'outline'}
    >
      <IconClock size={12} />
    </Button>
  );
};

export const DepartmentMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IDepartmentListItem, unknown>;
}) => {
  const [, setOpen] = useQueryState('department_id');
  const setRenderingDepartmentDetail = useSetAtom(
    renderingDepartmentDetailAtom,
  );
  const { _id } = cell.row.original;
  return (
    <Button
      onClick={() => {
        setOpen(_id);
        setRenderingDepartmentDetail(false);
      }}
      variant={'outline'}
    >
      <IconEdit size={12} />
    </Button>
  );
};

export const DepartmentRemoveCell = ({
  cell,
}: {
  cell: Cell<IDepartmentListItem, unknown>;
}) => {
  const { _id, title } = cell.row.original;
  const { confirm } = useConfirm();
  const { handleRemove, loading } = useRemoveDepartment();
  const onRemove = () => {
    confirm({
      message: `Are you sure you want to remove '${title}'`,
      options: { confirmationValue: 'delete' },
    }).then(() =>
      handleRemove({
        variables: {
          ids: [_id],
        },
      }),
    );
  };
  return (
    <Button
      variant={'outline'}
      disabled={loading}
      onClick={onRemove}
      className="text-destructive bg-destructive/10"
    >
      {loading ? <Spinner /> : <IconTrash size={12} />}
    </Button>
  );
};

export const DepartmentColumns: ColumnDef<IDepartmentListItem>[] = [
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
  {
    id: 'action-group',
    header: () => <RecordTable.InlineHead label="Actions" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell className="gap-1 [&>button]:px-2 justify-center">
          <DepartmentWorkingHoursColumnCell cell={cell} />
          <DepartmentMoreColumnCell cell={cell} />
          <DepartmentRemoveCell cell={cell} />
        </RecordTableInlineCell>
      );
    },
  },
];
