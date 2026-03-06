import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';
import { IByDate } from '~/modules/ebarimt/put-response/put-responses-by-date/types/ByDateType';
import { renderingByDateDetailAtom } from '~/modules/ebarimt/put-response/put-responses-by-date/states/ByDateDetailStates';

export const ByDateMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IByDate, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingByDateDetail = useSetAtom(renderingByDateDetailAtom);
  const { _id } = cell.row.original;

  const setOpen = (byDateId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('by_date_id', byDateId);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
        setRenderingByDateDetail(false);
      }}
    />
  );
};

export const byDateMoreColumn = {
  id: 'more',
  cell: ByDateMoreColumnCell,
  size: 33,
};
