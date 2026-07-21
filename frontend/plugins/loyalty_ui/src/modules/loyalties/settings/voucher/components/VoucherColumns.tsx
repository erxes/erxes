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
import { IVoucher } from '../types/voucherTypes';
import { VoucherNameCell } from '../voucher-detail/components/VoucherNameCell';
import { voucherMoreColumn } from './VoucherMoreColumn';

interface VoucherStatusMutationOptions {
  variables: {
    _id: string;
    status: string;
  };
}

export const voucherColumns = (
  t: TFunction<'loyalty'>,
  editStatus: (options: VoucherStatusMutationOptions) => unknown,
): ColumnDef<IVoucher>[] => [
  voucherMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IVoucher>,

  {
    id: 'title',
    accessorKey: 'title',
    header: () => (
      <RecordTable.InlineHead icon={IconTag} label={t('title', 'Title')} />
    ),
    cell: ({ cell }) => {
      return (
        <VoucherNameCell
          voucher={cell.row.original}
          name={cell.getValue() as string}
        />
      );
    },
    size: 150,
  },
  settingsStartDateColumn<IVoucher>(t),
  settingsEndDateColumn<IVoucher>(t),
  {
    id: 'voucherType',
    accessorKey: 'voucherType',
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
  settingsStatusSwitchColumn<IVoucher>(t, (_id, status) =>
    editStatus({
      variables: {
        _id,
        status,
      },
    })),
];
