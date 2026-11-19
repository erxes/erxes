import { Cell } from '@tanstack/table-core';
import { RecordTable } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router';
import { renderingAdjustClosingDetailAtom } from '../types/adjustClosingDetailStates';
import { IAdjustClosing } from '../types/AdjustClosing';

export const AdjustClosingMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IAdjustClosing, unknown>;
}) => {
  const navigate = useNavigate();
  const setRenderingDetail = useSetAtom(renderingAdjustClosingDetailAtom);
  const { _id } = cell.row.original;

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setRenderingDetail(false);
        navigate(`/accounting/adjustment/closing/${_id}`);
      }}
    />
  );
};

export const AdjustClosingMoreColumn = {
  id: 'more',
  cell: AdjustClosingMoreColumnCell,
  size: 33,
};
