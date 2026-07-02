import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  Command,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  toast,
  useQueryState,
} from 'erxes-ui';
import { TagsSelect } from 'ui-modules';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { IPackage, PACKAGE_STATUSES } from '../types/Package';
import { useChangePackageStatus, useEditPackage } from '../hooks/usePackageMutations';

const statusVariant = (status?: string) => {
  switch (status) {
    case 'active':
      return 'success' as const;
    case 'archived':
      return 'secondary' as const;
    default:
      return 'default' as const;
  }
};

const StatusCell = ({ pkg }: { pkg: IPackage }) => {
  const { t } = useTranslation('product', { keyPrefix: 'package' });
  const [open, setOpen] = useState(false);
  const { changeStatus, loading } = useChangePackageStatus();
  const current = pkg.status || 'draft';

  const handleSelect = async (next: string) => {
    setOpen(false);
    if (next === current) return;

    try {
      await changeStatus({ variables: { _id: pkg._id, status: next } });
      toast({ variant: 'success', title: t('status-updated', 'Status updated') });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: t('status-update-failed', 'Failed to update status'),
        description: e?.message,
      });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <RecordTableInlineCell.Trigger disabled={loading}>
        <Badge variant={statusVariant(current)}>{current}</Badge>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="w-36 min-w-0">
        <Command>
          <Command.List>
            {PACKAGE_STATUSES.map((s) => (
              <Command.Item key={s} value={s} onSelect={() => handleSelect(s)}>
                <Badge variant={statusVariant(s)}>{s}</Badge>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

const TagsCell = ({ pkg }: { pkg: IPackage }) => {
  const { t } = useTranslation('product', { keyPrefix: 'package' });
  const { editPackage } = useEditPackage(pkg._id);

  return (
    <TagsSelect.InlineCell
      scope={`package-tags-${pkg._id}`}
      type="core:product"
      mode="multiple"
      value={pkg.tagIds || []}
      onValueChange={(value) => {
        const tagIds = Array.isArray(value) ? value : value ? [value] : [];

        editPackage({
          variables: { _id: pkg._id, tagIds },
          onError: (e) => {
            toast({
              variant: 'destructive',
              title: t('tags-update-failed', 'Failed to update tags'),
              description: e.message,
            });
          },
        });
      }}
    />
  );
};

const formatPrice = (value?: number | null) =>
  value == null
    ? '—'
    : new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
        value,
      );

const formatDate = (value?: string) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
};

export const createPackageColumns = (
  t: TFunction,
): ColumnDef<IPackage>[] => [
  RecordTable.checkboxColumn as ColumnDef<IPackage>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label={t('name', 'Name')} />,
    cell: ({ row }) => {
      const [, setActivePackageId] = useQueryState<string>('activePackageId');
      return (
        <RecordTableInlineCell>
          <Badge
            variant="secondary"
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setActivePackageId(row.original._id);
            }}
          >
            {row.original.name || t('unnamed', 'Unnamed')}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'productCount',
    header: () => <RecordTable.InlineHead label={t('products', 'Products')} />,
    cell: ({ row }) => (
      <RecordTableInlineCell className="text-sm">
        {row.original.products?.length ?? 0}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'price',
    accessorKey: 'price',
    header: () => <RecordTable.InlineHead label={t('price', 'Price')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="text-sm">
        {formatPrice(cell.getValue() as number | undefined)}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'totalPrice',
    accessorKey: 'totalPrice',
    header: () => <RecordTable.InlineHead label={t('total-price', 'Total Price')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="text-sm">
        {formatPrice(cell.getValue() as number | undefined)}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'tags',
    header: () => <RecordTable.InlineHead label={t('tags', 'Tags')} />,
    size: 240,
    cell: ({ row }) => <TagsCell pkg={row.original} />,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label={t('status', 'Status')} />,
    size: 120,
    cell: ({ row }) => <StatusCell pkg={row.original} />,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead label={t('created', 'Created')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="text-sm">
        {formatDate(cell.getValue() as string | undefined)}
      </RecordTableInlineCell>
    ),
  },
];
