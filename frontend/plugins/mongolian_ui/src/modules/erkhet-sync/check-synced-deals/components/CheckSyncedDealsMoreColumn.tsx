import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';
import { ICheckSyncedDeals } from '../types/checkSyncedDeals';
import { renderingSyncErkhetHistoryDetailAtom } from '../../sync-erkhet-history/states/syncErkhetHistoryDetailStates';

export const CheckSyncedDealsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ICheckSyncedDeals, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingSyncErkhetHistoryDetail = useSetAtom(
    renderingSyncErkhetHistoryDetailAtom,
  );
  const { _id } = cell.row.original;

  const setOpen = (dealId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('deal_id', dealId);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
        setRenderingSyncErkhetHistoryDetail(false);
      }}
    />
  );
};

export const CheckSyncedDealsMoreColumn = {
  id: 'more',
  cell: CheckSyncedDealsMoreColumnCell,
  size: 33,
};
