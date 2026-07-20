import { IconTag } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { RecordTable } from 'erxes-ui';
import { TFunction } from 'i18next';
import {
  settingsEndDateColumn,
  settingsStartDateColumn,
  settingsStatusBadgeColumn,
} from '~/modules/loyalties/components/LoyaltyCampaignColumnHelpers';
import { DonationNameCell } from '../donation-detail/components/DonationNameCell';
import { IDonation } from '../types/donationTypes';
import { donationMoreColumn } from './DonateMoreColumn';

export const donationColumns = (
  t: TFunction<'loyalty'>,
): ColumnDef<IDonation>[] => [
  donationMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IDonation>,

  {
    id: 'name',
    accessorKey: 'title',
    header: () => (
      <RecordTable.InlineHead icon={IconTag} label={t('name')} />
    ),
    cell: ({ cell }) => {
      return (
        <DonationNameCell
          donation={cell.row.original}
          name={cell.getValue() as string}
        />
      );
    },
    size: 150,
  },
  settingsStartDateColumn<IDonation>(t),
  settingsEndDateColumn<IDonation>(t),
  settingsStatusBadgeColumn<IDonation>(t),
];
