import {
  IconAlignLeft,
  IconCalendarPlus,
  IconHash,
  IconTag,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { IPricing } from '@/pricing/types';
import { MembersInline } from 'ui-modules';
import { Link } from 'react-router-dom';
import { PricingMoreCell } from '@/pricing/components/PricingMoreCell';
import { priorityLabelKey } from '@/pricing/constants';

const PricingPriorityCell = ({ value }: { value: IPricing['priority'] }) => {
  const { t } = useTranslation('loyalty');

  return (
    <RecordTableInlineCell>
      <Badge variant="secondary">{t(priorityLabelKey(value))}</Badge>
    </RecordTableInlineCell>
  );
};

export const pricingColumns = (
  t: TFunction<'loyalty'>,
): ColumnDef<IPricing>[] => [
  {
    id: 'more',
    cell: (cell) => <PricingMoreCell {...cell} />,
    size: 33,
  },
  RecordTable.checkboxColumn as ColumnDef<IPricing>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => (
      <RecordTable.InlineHead label={t('name')} icon={IconAlignLeft} />
    ),
    cell: ({ cell, row }) => {
      const pricingId = row.original._id;
      return (
        <RecordTableInlineCell>
          <Link
            to={`/settings/loyalty/pricing/${pricingId}`}
            className="cursor-pointer hover:underline"
          >
            <Badge variant="secondary">{cell.getValue() as string}</Badge>
          </Link>
        </RecordTableInlineCell>
      );
    },
    size: 250,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label={t('status')} icon={IconHash} />,
    cell: ({ cell }) => {
      const status = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <Badge
            variant={status === 'active' ? 'success' : 'secondary'}
            className="uppercase"
          >
            {status}
          </Badge>
        </RecordTableInlineCell>
      );
    },
    size: 350,
  },
  {
    id: 'priority',
    accessorKey: 'priority',
    header: () => (
      <RecordTable.InlineHead label={t('priority')} icon={IconTag} />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as IPricing['priority'];
      return <PricingPriorityCell value={value} />;
    },
  },
  {
    id: 'applyType',
    accessorKey: 'applyType',
    header: () => (
      <RecordTable.InlineHead label={t('apply-type')} icon={IconTag} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <Badge variant="secondary" className="lowercase">
            {cell.getValue() as string}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdBy',
    accessorKey: 'createdBy',
    header: () => (
      <RecordTable.InlineHead label={t('created-by')} icon={IconUser} />
    ),
    cell: ({ cell }) => {
      const createdById = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <MembersInline
            memberIds={createdById ? [createdById] : []}
            size="sm"
            allowUnassigned
          />
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
  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    header: () => (
      <RecordTable.InlineHead
        label={t('last-updated-at')}
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
