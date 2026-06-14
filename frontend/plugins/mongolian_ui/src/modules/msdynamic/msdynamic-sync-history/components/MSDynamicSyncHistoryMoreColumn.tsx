import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';
import { renderingMSDynamicSyncHistoryDetailAtom } from '../../states/msDynamicSyncHistoryDetailStates';
import { IMSDynamicSyncHistory } from '../types/msDynamicSyncHistory';

export const MSDynamicSyncHistoryMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IMSDynamicSyncHistory, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setMSDynamicSyncHistoryDetailAtom = useSetAtom(
    renderingMSDynamicSyncHistoryDetailAtom,
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
        setMSDynamicSyncHistoryDetailAtom(false);
      }}
    />
  );
};

export const MSDynamicSyncHistoryMoreColumn = {
  id: 'more',
  cell: MSDynamicSyncHistoryMoreColumnCell,
  size: 33,
};
