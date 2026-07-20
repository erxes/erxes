import { IconTag } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { RecordTable } from 'erxes-ui';
import { TFunction } from 'i18next';
import {
  settingsEndDateColumn,
  settingsStartDateColumn,
  settingsStatusBadgeColumn,
} from '~/modules/loyalties/components/LoyaltyCampaignColumnHelpers';
import { LotteryNameCell } from '../lottery-detail/components/LotteryNameCell';
import { ILottery } from '../types/lotteryTypes';
import { lotteryMoreColumn } from './LotteryMoreColumn';

export const lotteryColumns = (
  t: TFunction<'loyalty'>,
): ColumnDef<ILottery>[] => [
  lotteryMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ILottery>,

  {
    id: 'title',
    accessorKey: 'title',
    header: () => (
      <RecordTable.InlineHead icon={IconTag} label={t('title')} />
    ),
    cell: ({ cell }) => {
      return (
        <LotteryNameCell
          lottery={cell.row.original}
          name={cell.getValue() as string}
        />
      );
    },
    size: 150,
  },
  settingsStartDateColumn<ILottery>(t),
  settingsEndDateColumn<ILottery>(t),
  settingsStatusBadgeColumn<ILottery>(t),
];
