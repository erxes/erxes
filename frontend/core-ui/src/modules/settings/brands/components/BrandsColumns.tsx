import { IconAlignLeft, IconCalendarPlus, IconHash } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  Input,
  RecordTable,
  RecordTableInlineCell,
  Popover,
  RelativeDateDisplay,
  Textarea,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { renderingBrandDetailAtom } from '../state';
import { IBrand } from '../types';
import { useState } from 'react';
import { useBrandsEdit } from '@/settings/brands/hooks/useBrandsEdit';

export const brandsColumns: ColumnDef<IBrand>[] = [
  RecordTable.checkboxColumn as ColumnDef<IBrand>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => (
      <RecordTable.InlineHead label="brand name" icon={IconAlignLeft} />
    ),
    cell: ({ cell }) => {
      const [, setBrandDetail] = useQueryState('brand_id');
      const setRenderingBrandDetail = useSetAtom(renderingBrandDetailAtom);
      const { _id, name } = cell.row.original;
      const [open, setOpen] = useState<boolean>(false);
      const [_name, setName] = useState<string>(name);

      const { handleEdit, loading } = useBrandsEdit();
      const onSave = () => {
        if (name !== _name) {
          handleEdit(
            {
              variables: {
                id: _id,
                name: _name,
              },
            },
            ['name'],
          );
        }
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
          <RecordTableInlineCell.Trigger>
            <Badge
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setRenderingBrandDetail(true);
                setBrandDetail(cell.row.original._id);
              }}
            >
              {cell.getValue() as string}
            </Badge>
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content className="min-w-72">
            <Input value={_name} onChange={onChange} disabled={loading} />
          </RecordTableInlineCell.Content>
        </Popover>
      );
    },
    size: 250,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => (
      <RecordTable.InlineHead label="description" icon={IconHash} />
    ),
    cell: ({ cell }) => {
      const { _id, description, name } = cell.row.original;
      const [open, setOpen] = useState<boolean>(false);
      const [_description, setDescription] = useState<string>(description);
      const { handleEdit, loading } = useBrandsEdit();
      const onSave = () => {
        if (_description !== description) {
          handleEdit(
            {
              variables: {
                id: _id,
                name: name,
                description: _description,
              },
            },
            ['description', 'name'],
          );
        }
      };
      const onChange = (el: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(el.currentTarget.value);
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
            <Textarea
              value={_description}
              onChange={onChange}
              disabled={loading}
            />
          </RecordTableInlineCell.Content>
        </Popover>
      );
    },
    size: 350,
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead label="code" icon={IconHash} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <Badge>{cell.getValue() as string}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead label="date created" icon={IconCalendarPlus} />
    ),
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell>
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
];
