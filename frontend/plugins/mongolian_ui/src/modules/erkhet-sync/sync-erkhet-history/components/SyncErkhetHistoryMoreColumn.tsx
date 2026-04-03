import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';
import { ISyncHistory } from '../types/syncHistory';
import { renderingSyncErkhetHistoryDetailAtom } from '../states/syncErkhetHistoryDetailStates';

export const SyncErkhetHistoryMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ISyncHistory, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingSyncErkhetHistoryDetail = useSetAtom(
    renderingSyncErkhetHistoryDetailAtom,
  );
  const { _id } = cell.row.original;

  const setOpen = (syncHistoryId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('syncHistory_id', syncHistoryId);
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

export const SyncErkhetHistoryMoreColumn = {
  id: 'more',
  cell: SyncErkhetHistoryMoreColumnCell,
  size: 33,
};
