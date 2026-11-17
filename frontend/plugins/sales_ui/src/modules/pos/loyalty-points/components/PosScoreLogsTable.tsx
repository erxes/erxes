import {
  IconBuildingStore,
  IconCashRegister,
  IconExternalLink,
  IconLabelFilled,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { BranchesInline, useSidePanel } from 'ui-modules';
import { POS_ORDER_CONTENT_TYPE } from '@/pos/constants/posPanel';
import { useLoyaltyDrill } from '@/loyalty-points/drill';
import {
  Cell,
  OpenableCell,
  ScoreLogsTableView,
  useScoreLogColumns,
} from '@/loyalty-points/components/ScoreLogsTable';
import { TPosScoreLogRow, usePosScoreLogs } from '../hooks/usePosScoreLogs';

const OrderCell = ({ row }: { row: TPosScoreLogRow }) => {
  const { t } = useTranslation('sales');
  const { openRecord } = useSidePanel();
  const drill = useLoyaltyDrill();

  const open = () => {
    drill?.close();
    openRecord({ contentType: POS_ORDER_CONTENT_TYPE, contentId: row.orderId });
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
