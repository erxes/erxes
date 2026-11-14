import { Cell } from '@tanstack/react-table';
import { RecordTable } from 'erxes-ui';
import { useSidePanel } from 'ui-modules';
import { IPosItem } from '@/pos/pos-items/types/posItem';
import { POS_ORDER_CONTENT_TYPE } from '@/pos/constants/posPanel';
import { toPosItemOrderId } from '@/pos/utils/posOrderJson';

export const PosItemMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IPosItem, unknown>;
}) => {
  const { openRecord } = useSidePanel();

  const setOpen = (orderId: string) => {
    openRecord({ contentType: POS_ORDER_CONTENT_TYPE, contentId: orderId });
  };

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(toPosItemOrderId(cell.row.original));
      }}
    />
  );
};

export const PosItemMoreColumn = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: PosItemMoreColumnCell,
  size: 33,
};
