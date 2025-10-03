import { type Cell, type ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  Button,
  Input,
  RecordTable,
  RecordTableInlineCell,
  Popover,
  RecordTableTree,
  Spinner,
  Textarea,
  TextOverflowTooltip,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { renderingBranchDetailAtom } from '../../states/renderingBranchDetail';
import { IconClock, IconEdit, IconHash, IconTrash } from '@tabler/icons-react';
import { IBranchListItem } from '../../types/branch';
import { SelectBranches } from 'ui-modules';
import {
  useBranchInlineEdit,
  useRemoveBranch,
} from '../../hooks/useBranchActions';
import { ChangeEvent, useState } from 'react';

export const BranchEditColumnCell = ({
  cell,
}: {
  cell: Cell<IBranchListItem, unknown>;
}) => {
  const [, setOpen] = useQueryState('branch_id');
  const setRenderingBranchDetail = useSetAtom(renderingBranchDetailAtom);
  const { _id } = cell.row.original;
  return (
    <Button
      onClick={() => {
        setOpen(_id);
        setRenderingBranchDetail(false);
      }}
      variant={'outline'}
    >
      <IconEdit size={12} />
    </Button>
  );
};
export const BranchWorkingHoursColumnCell = ({
  cell,
}: {
  cell: Cell<IBranchListItem, unknown>;
}) => {
  const [, setOpen] = useQueryState('workingHoursId');
  const setRenderingBranchDetail = useSetAtom(renderingBranchDetailAtom);
  const { _id } = cell.row.original;
  return (
    <Button
      onClick={() => {
        setOpen(_id);
        setRenderingBranchDetail(false);
      }}
      variant={'outline'}
    >
      <IconClock size={12} />
    </Button>
  );
};

export const BranchRemoveCell = ({
  cell,
}: {
  cell: Cell<IBranchListItem, unknown>;
}) => {
  const { confirm } = useConfirm();
  const { _id, title } = cell.row.original;
  const { handleRemove, loading } = useRemoveBranch();

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

export const BranchColumns: ColumnDef<IBranchListItem>[] = [
  RecordTable.checkboxColumn as ColumnDef<IBranchListItem>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconHash} label="code" />,
    cell: ({ cell }) => {
      const { code, _id } = cell.row.original;
      const [_code, setCode] = useState<string>(code);
      const { branchesEdit, loading } = useBranchInlineEdit();
      const [open, setOpen] = useState<boolean>(false);

      const onSave = () => {
        if (_code !== code) {
          branchesEdit({ variables: { id: _id, code: _code } }, ['code']);
        }
      };

      const onChange = (el: ChangeEvent<HTMLInputElement>) => {
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
              order={cell.row.original.order}
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
      const { title, _id, code } = cell.row.original;
      const [_title, setTitle] = useState<string>(title);
      const { branchesEdit, loading } = useBranchInlineEdit();
      const [open, setOpen] = useState<boolean>(false);

      const onSave = () => {
        if (_title !== title) {
          branchesEdit({ variables: { id: _id, title: _title, code } }, [
            'title',
            'code',
          ]);
        }
      };

      const onChange = (el: ChangeEvent<HTMLInputElement>) => {
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
    size: 250,
  },
  {
    id: 'parentId',
    accessorKey: 'parentId',
    header: () => <RecordTable.InlineHead label="parent" />,
    cell: ({ cell }) => {
      const { parentId, _id, code } = cell.row.original;
      const { branchesEdit, loading } = useBranchInlineEdit();

      return (
        <SelectBranches.InlineCell
          mode="single"
          value={cell.getValue() as string}
          onValueChange={(value) => {
            if (value !== parentId) {
              branchesEdit(
                { variables: { id: _id, parentId: value, code: code } },
                ['parentId', 'code'],
              );
            }
          }}
        />
      );
    },
    size: 240,
  },
  {
    id: 'address',
    accessorKey: 'address',
    header: () => <RecordTable.InlineHead label="address" />,
    cell: ({ cell }) => {
      const { address, _id, code } = cell.row.original;
      const [_address, setAddress] = useState<string>(address);
      const { branchesEdit, loading } = useBranchInlineEdit();
      const [open, setOpen] = useState<boolean>(false);

      const onSave = () => {
        if (_address !== address) {
          branchesEdit(
            { variables: { id: _id, address: _address, code: code } },
            ['address', 'code'],
          );
        }
      };

      const onChange = (el: ChangeEvent<HTMLTextAreaElement>) => {
        const { value } = el.currentTarget;
        setAddress(value);
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
            <Textarea value={_address} onChange={onChange} />
          </RecordTableInlineCell.Content>
        </Popover>
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
        <RecordTableInlineCell className="text-center flex w-full justify-center">
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
        <RecordTableInlineCell className="flex justify-center gap-1 [&>button]:px-2">
          <BranchWorkingHoursColumnCell cell={cell} />
          <BranchEditColumnCell cell={cell} />
          <BranchRemoveCell cell={cell} />
        </RecordTableInlineCell>
      );
    },
  },
];
