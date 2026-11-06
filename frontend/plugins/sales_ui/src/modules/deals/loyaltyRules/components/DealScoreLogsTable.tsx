import {
  IconArrowsRight,
  IconExternalLink,
  IconLabelFilled,
  IconLayoutKanban,
  IconProgressCheck,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { RecordTable, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  Cell,
  OpenableCell,
  ScoreLogsTableView,
  useScoreLogColumns,
} from '@/loyalty-points/components/ScoreLogsTable';
import {
  TDealScoreLogRow,
  TDealScoreLogScope,
  useDealScoreLogs,
} from '../hooks/useDealScoreLogs';

const DealNameCell = ({ row }: { row: TDealScoreLogRow }) => {
  const { t } = useTranslation('sales');
  const [, setSalesItemId] = useQueryState<string>('salesItemId');

  return (
    <OpenableCell
      label={row.dealName || row.dealId}
      title={t('loyalty-log-open-deal', 'Open deal')}
    >
      <button type="button" onClick={() => setSalesItemId(row.dealId)}>
        <IconExternalLink size={14} />
      </button>
    </OpenableCell>
  );
};

const useDealScoreLogColumns = (
  scope: TDealScoreLogScope,
): ColumnDef<TDealScoreLogRow>[] => {
  const { t } = useTranslation('sales');

  // A list across pipelines says where each deal stands.
  const placeColumns: ColumnDef<TDealScoreLogRow>[] =
    scope === 'all'
      ? [
          {
            id: 'board',
            header: () => (
              <RecordTable.InlineHead
                label={t('board')}
                icon={IconLayoutKanban}
              />
            ),
            cell: ({ row }) => <Cell>{row.original.boardName || ''}</Cell>,
            size: 160,
          },
          {
            id: 'pipeline',
            header: () => (
              <RecordTable.InlineHead
                label={t('pipeline', 'Pipeline')}
                icon={IconArrowsRight}
              />
            ),
            cell: ({ row }) => <Cell>{row.original.pipelineName || ''}</Cell>,
            size: 160,
          },
        ]
      : [];

  return [
    {
      id: 'deal',
      header: () => (
        <RecordTable.InlineHead label={t('name')} icon={IconLabelFilled} />
      ),
      cell: ({ row }) => <DealNameCell row={row.original} />,
      size: 240,
    },
    ...placeColumns,
    {
      id: 'stage',
      header: () => (
        <RecordTable.InlineHead label={t('stage')} icon={IconProgressCheck} />
      ),
      cell: ({ row }) => <Cell>{row.original.stageName || ''}</Cell>,
      size: 160,
    },
    ...useScoreLogColumns<TDealScoreLogRow>(),
  ];
};

export const DealScoreLogsTable = ({
  scope = 'pipeline',
}: {
  scope?: TDealScoreLogScope;
}) => {
  const { t } = useTranslation('sales');
  const columns = useDealScoreLogColumns(scope);

  return (
    <ScoreLogsTableView
      {...useDealScoreLogs(scope)}
      columns={columns}
      tableId={`sales_deal_score_logs_${scope}`}
      stickyColumn="deal"
      emptyDescription={t(
        'loyalty-logs-empty-description',
        'Points earned, spent and refunded by the deals in this filter appear here.',
      )}
    />
  );
};
