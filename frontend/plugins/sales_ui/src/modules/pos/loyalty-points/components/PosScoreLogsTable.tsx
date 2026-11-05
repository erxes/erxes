import {
  IconBuildingStore,
  IconCashRegister,
  IconExternalLink,
  IconLabelFilled,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { BranchesInline } from 'ui-modules';
import {
  Cell,
  OpenableCell,
  ScoreLogsTableView,
  useScoreLogColumns,
} from '@/loyalty-points/components/ScoreLogsTable';
import { TPosScoreLogRow, usePosScoreLogs } from '../hooks/usePosScoreLogs';

const OrderCell = ({ row }: { row: TPosScoreLogRow }) => {
  const { t } = useTranslation('sales');
  const [searchParams, setSearchParams] = useSearchParams();

  // The order sheet opens on this key wherever it is mounted.
  const open = () => {
    const next = new URLSearchParams(searchParams);

    next.set('pos_order_id', row.orderId);
    setSearchParams(next);
  };

  return (
    <OpenableCell
      label={row.orderNumber ? `#${row.orderNumber}` : row.orderId}
      title={t('loyalty-log-open-order', 'Open order')}
    >
      <button type="button" onClick={open}>
        <IconExternalLink size={14} />
      </button>
    </OpenableCell>
  );
};

const usePosScoreLogColumns = (): ColumnDef<TPosScoreLogRow>[] => {
  const { t } = useTranslation('sales');

  return [
    {
      id: 'order',
      header: () => (
        <RecordTable.InlineHead
          label={t('loyalty-log-order', 'Order')}
          icon={IconLabelFilled}
        />
      ),
      cell: ({ row }) => <OrderCell row={row.original} />,
      size: 160,
    },
    {
      id: 'pos',
      header: () => (
        <RecordTable.InlineHead label={t('pos')} icon={IconCashRegister} />
      ),
      cell: ({ row }) => <Cell>{row.original.posName || ''}</Cell>,
      size: 180,
    },
    {
      id: 'branch',
      header: () => (
        <RecordTable.InlineHead
          label={t('branch', 'Branch')}
          icon={IconBuildingStore}
        />
      ),
      cell: ({ row }) => (
        <Cell>
          {row.original.branchId && (
            <BranchesInline branchIds={[row.original.branchId]} />
          )}
        </Cell>
      ),
      size: 160,
    },
    ...useScoreLogColumns<TPosScoreLogRow>(),
  ];
};

/** One row per loyalty entry the matching POS orders caused. */
export const PosScoreLogsTable = () => {
  const { t } = useTranslation('sales');
  const columns = usePosScoreLogColumns();

  return (
    <ScoreLogsTableView
      {...usePosScoreLogs()}
      columns={columns}
      tableId="sales_pos_score_logs"
      stickyColumn="order"
      emptyDescription={t(
        'loyalty-logs-empty-description-pos',
        'Points earned, spent and refunded by the orders in this filter appear here.',
      )}
    />
  );
};
