import { IconTag } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { RecordTable } from 'erxes-ui';
import { TFunction } from 'i18next';
import {
  settingsEndDateColumn,
  settingsStartDateColumn,
  settingsStatusBadgeColumn,
} from '~/modules/loyalties/components/LoyaltyCampaignColumnHelpers';
import { SpinNameCell } from '../spin-detail/components/SpinNameCell';
import { ISpin } from '../types/spinTypes';
import { spinMoreColumn } from './SpinMoreColumn';

export const spinColumns = (
  t: TFunction<'loyalty'>,
): ColumnDef<ISpin>[] => [
  spinMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ISpin>,

  {
    id: 'title',
    accessorKey: 'title',
    header: () => (
      <RecordTable.InlineHead icon={IconTag} label={t('title')} />
    ),
    cell: ({ cell }) => {
      return (
        <SpinNameCell
          spin={cell.row.original}
          name={cell.getValue() as string}
        />
      );
    },
    size: 150,
  },
  settingsStartDateColumn<ISpin>(t),
  settingsEndDateColumn<ISpin>(t),
  settingsStatusBadgeColumn<ISpin>(t),
];
