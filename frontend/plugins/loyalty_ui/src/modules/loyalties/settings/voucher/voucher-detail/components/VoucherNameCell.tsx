import { useQueryState } from 'erxes-ui';
import { IVoucher } from '../../types/voucherTypes';

interface VoucherNameCellProps {
  voucher: IVoucher;
  name: string;
}

export const VoucherNameCell = ({ voucher, name }: VoucherNameCellProps) => {
  const [, setEditOpen] = useQueryState('editVoucherId');

  return (
    <div
      role="button"
      tabIndex={0}
      className="cursor-pointer px-3 py-2"
      onClick={() => {
        setEditOpen(voucher._id);
      }}
    >
      {name}
    </div>
  );
};
