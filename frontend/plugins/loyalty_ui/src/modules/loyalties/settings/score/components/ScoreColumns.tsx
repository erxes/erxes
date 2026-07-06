import {
  IconLabelFilled,
  IconListNumbers,
  IconTag,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';
import { TFunction } from 'i18next';
import { settingsStatusSwitchColumn } from '~/modules/loyalties/components/LoyaltyCampaignColumnHelpers';
import { ScoreNameCell } from '../score-detail/components/ScoreNameCell';
import { IScore } from '../types/loyaltyScoreTypes';
import { scoreMoreColumn } from './LoyaltyScoreMoreColumn';

interface ScoreStatusMutationOptions {
  variables: {
    _id: string;
    kind: 'score';
    status: string;
  };
}

export const scoreColumns = (
  t: TFunction<'loyalty'>,
  editStatus: (options: ScoreStatusMutationOptions) => unknown,
): ColumnDef<IScore>[] => [
  scoreMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IScore>,

  {
    id: 'title',
    accessorKey: 'title',
    header: () => (
      <RecordTable.InlineHead icon={IconTag} label={t('title', 'Title')} />
    ),
    cell: ({ cell }) => {
      return (
        <ScoreNameCell
          score={cell.row.original}
          name={cell.getValue() as string}
        />
      );
    },
    size: 150,
  },
  {
    id: 'order',
    accessorKey: 'order',
    header: () => (
      <RecordTable.InlineHead icon={IconListNumbers} label={t('order', 'Order')} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={`${cell.getValue() ?? ''}`} />
        </RecordTableInlineCell>
      );
    },
    size: 80,
  },
  {
    id: 'ownerType',
    accessorKey: 'ownerType',
    header: () => (
      <RecordTable.InlineHead icon={IconLabelFilled} label={t('owner-type', 'Owner Type')} />
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
  settingsStatusSwitchColumn<IScore>(t, (_id, status) =>
    editStatus({
      variables: {
        _id,
        kind: 'score',
        status,
      },
    })),
];
