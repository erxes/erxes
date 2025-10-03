import { Cell, ColumnDef } from '@tanstack/table-core';
import { IPositionListItem } from '../../types/position';
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
import { IconEdit, IconHash, IconTrash } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { renderingPositionDetailAtom } from '../../states/renderingPositionDetail';
import { SelectPositions } from 'ui-modules';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import {
  usePositionInlineEdit,
  useRemovePosition,
} from '../../hooks/usePositionActions';
import { useState } from 'react';
import clsx from 'clsx';

export const UnitEditColumnCell = ({
  cell,
}: {
  cell: Cell<IPositionListItem, unknown>;
}) => {
  const [, setOpen] = useQueryState('position_id');
  const setRenderingCustomerDetail = useSetAtom(renderingPositionDetailAtom);
  const { _id } = cell.row.original;
  return (
    <Button
      onClick={() => {
        setOpen(_id);
        setRenderingCustomerDetail(false);
      }}
      variant={'outline'}
    >
      <IconEdit size={12} />
    </Button>
  );
};

const UnitRemoveCell = ({
  cell,
}: {
  cell: Cell<IPositionListItem, unknown>;
}) => {
  const { confirm } = useConfirm();
  const { _id, title } = cell.row.original || {};
  const { handleRemove, loading } = useRemovePosition();
  const onRemove = () => {
    confirm({
      message: `Are you sure you want to delete "${title}" position?`,
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

export const PositionsColumns: ColumnDef<IPositionListItem>[] = [
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
  {
    id: 'action-group',
    header: () => <RecordTable.InlineHead label="Actions" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell className="justify-center gap-1 [&>button]:px-2">
          <UnitEditColumnCell cell={cell} />
          <UnitRemoveCell cell={cell} />
        </RecordTableInlineCell>
      );
    },
  },
];
