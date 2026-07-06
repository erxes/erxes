import { IconTag, IconTicket } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';
import { TFunction } from 'i18next';
import {
  settingsEndDateColumn,
  settingsStartDateColumn,
  settingsStatusSwitchColumn,
} from '~/modules/loyalties/components/LoyaltyCampaignColumnHelpers';
import { ICoupon } from '../types/couponTypes';
import { CouponNameCell } from '../coupon-detail/components/CouponNameCell';
import { couponMoreColumn } from './CouponMoreColumn';

interface CouponStatusMutationOptions {
  variables: {
    _id: string;
    status: string;
  };
}

export const couponColumns = (
  t: TFunction<'loyalty'>,
  editStatus: (options: CouponStatusMutationOptions) => unknown,
): ColumnDef<ICoupon>[] => [
  couponMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ICoupon>,

  {
    id: 'title',
    accessorKey: 'title',
    header: () => (
      <RecordTable.InlineHead icon={IconTag} label={t('title', 'Title')} />
    ),
    cell: ({ cell }) => {
      return (
        <CouponNameCell
          coupon={cell.row.original}
          name={cell.getValue() as string}
        />
      );
    },
    size: 150,
  },
  settingsStartDateColumn<ICoupon>(t),
  settingsEndDateColumn<ICoupon>(t),
  {
    id: 'kind',
    accessorKey: 'kind',
    header: () => (
      <RecordTable.InlineHead icon={IconTicket} label={t('type', 'Type')} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  settingsStatusSwitchColumn<ICoupon>(t, (_id, status) =>
    editStatus({
      variables: {
        _id,
        status,
      },
    })),
];
