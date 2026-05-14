import { useQueryState } from 'erxes-ui';
import { ICoupon } from '../../types/couponTypes';

interface CouponNameCellProps {
  coupon: ICoupon;
  name: string;
}

export const CouponNameCell = ({ coupon, name }: CouponNameCellProps) => {
  const [, setEditOpen] = useQueryState('editCouponId');

  return (
    <button
      type="button"
      className="px-3 py-2 cursor-pointer"
      onClick={() => {
        setEditOpen(coupon._id);
      }}
    >
      {name}
    </button>
  );
};
