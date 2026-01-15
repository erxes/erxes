import { useQueryState } from 'erxes-ui';
import { ICoupon } from '../../types/couponTypes';

interface CouponNameCellProps {
  coupon: ICoupon;
  name: string;
}

export const CouponNameCell = ({ coupon, name }: CouponNameCellProps) => {
  const [, setEditOpen] = useQueryState('editCouponId');

  return (
    <div
      className="cursor-pointer px-3 py-2"
      onClick={() => {
        setEditOpen(coupon._id);
      }}
    >
      {name}
    </div>
  );
};
