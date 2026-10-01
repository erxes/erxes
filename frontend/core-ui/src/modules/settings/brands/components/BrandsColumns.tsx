import {
  IconAlignJustified,
  IconAlignLeft,
  IconCalendarPlus,
  IconHash,
} from '@tabler/icons-react';
import { ColumnDef, Cell } from '@tanstack/table-core';
import {
  Badge,
  Input,
  RecordTable,
  RecordTableInlineCell,
  Popover,
  RelativeDateDisplay,
  Textarea,
  TextOverflowTooltip,
} from 'erxes-ui';
import { IBrand } from '../types';
import { useState } from 'react';
import { useBrandsEdit } from '@/settings/brands/hooks/useBrandsEdit';
import { TFunction } from 'i18next';
import { brandsMoreColumn } from './BrandsMoreColumn';

const BrandNameCell = ({ cell }: { cell: Cell<IBrand, unknown> }) => {
  const { _id, name } = cell.row.original;
  const [open, setOpen] = useState(false);
  const { handleEdit, loading } = useBrandsEdit();
  const [_name, setName] = useState<string>(name);

  const onSave = () => {
    const trimmed = _name.trim();
    if (!trimmed) {
      setName(name);
      return;
    }
    if (trimmed !== name) {
      handleEdit({ variables: { id: _id, name: trimmed } }, ['name']);
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
        if (!open) onSave();
      }}
    >
      <RecordTableInlineCell.Trigger>{name}</RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="min-w-72">
        <Input value={_name} onChange={onChange} disabled={loading} />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

const BrandDescriptionCell = ({ cell }: { cell: Cell<IBrand, unknown> }) => {
  const { _id, description, name } = cell.row.original;
  const [open, setOpen] = useState<boolean>(false);
  const [_description, setDescription] = useState<string>(description);
  const { handleEdit, loading } = useBrandsEdit();
  const onSave = () => {
    const trimmed = _description.trim();
    if (!trimmed) {
      setDescription(description);
      return;
    }

    if (trimmed !== description) {
      handleEdit(
        {
          variables: {
            id: _id,
            name: name,
            description: trimmed,
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
        <Textarea value={_description} onChange={onChange} disabled={loading} />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

export const brandsColumns: (t: TFunction) => ColumnDef<IBrand>[] = (t) => [
  brandsMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IBrand>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => (
      <RecordTable.InlineHead label={t('brand-name')} icon={IconAlignLeft} />
    ),
    cell: ({ cell }) => <BrandNameCell cell={cell} />,
    size: 250,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => (
      <RecordTable.InlineHead label={t('description')} icon={IconHash} />
    ),
    cell: ({ cell }) => <BrandDescriptionCell cell={cell} />,
    size: 350,
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: () => (
      <RecordTable.InlineHead label={t('code')} icon={IconAlignJustified} />
    ),
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
      <RecordTable.InlineHead
        label={t('date-created')}
        icon={IconCalendarPlus}
      />
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
