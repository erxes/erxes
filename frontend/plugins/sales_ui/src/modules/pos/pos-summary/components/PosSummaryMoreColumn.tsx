import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';
import { renderingPosSummaryDetailAtom } from '@/pos/pos-summary/states/PosSummaryDetail';
import { IPosSummary } from '@/pos/pos-summary/types/posSummary';

export const PosSummaryMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IPosSummary, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingPosSummaryDetail = useSetAtom(
    renderingPosSummaryDetailAtom,
  );
  const { _id } = cell.row.original;

  const setOpen = (posSummaryId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('pos_summary_id', posSummaryId);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
        setRenderingPosSummaryDetail(true);
      }}
    />
  );
};

export const PosSummaryMoreColumn = {
  id: 'more',
  cell: PosSummaryMoreColumnCell,
  size: 33,
};
