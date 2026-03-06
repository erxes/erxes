import { Cell } from '@tanstack/react-table';
import { IPutResponse } from '~/modules/ebarimt/put-response/types/PutResponseType';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';
import { renderingPutResponseDetailAtom } from '~/modules/ebarimt/put-response/states/PutResponseDetailStates';

export const PutResponseMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IPutResponse, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingPutResponseDetail = useSetAtom(
    renderingPutResponseDetailAtom,
  );
  const { _id } = cell.row.original;

  const setOpen = (putResponseId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('put_response_id', putResponseId);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
        setRenderingPutResponseDetail(false);
      }}
    />
  );
};

export const putResponseMoreColumn = {
  id: 'more',
  cell: PutResponseMoreColumnCell,
  size: 33,
};
