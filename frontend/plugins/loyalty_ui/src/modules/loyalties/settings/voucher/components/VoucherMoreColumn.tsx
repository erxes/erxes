import { Cell } from '@tanstack/react-table';
import { renderingVoucherDetailAtom } from '../voucher-detail/states/voucherDetailStates';
import { IVoucher } from '../types/voucherTypes';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';

export const VoucherMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IVoucher, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingVoucherDetail = useSetAtom(renderingVoucherDetailAtom);
  const { _id } = cell.row.original;

  const setOpen = (voucherId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('voucher_id', voucherId);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
        setRenderingVoucherDetail(false);
      }}
    />
  );
};

export const voucherMoreColumn = {
  id: 'more',
  cell: VoucherMoreColumnCell,
  size: 33,
};
