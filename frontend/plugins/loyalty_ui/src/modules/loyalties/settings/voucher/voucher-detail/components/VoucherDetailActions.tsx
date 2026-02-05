import { useVoucherDetailWithQuery } from '../hooks/useVoucherDetailWithQuery';
import { LoyaltyVoucherEditSheet } from './LoyaltyVoucherEditSheet';
import { useQueryState } from 'erxes-ui';

export const VoucherDetailActions = () => {
  const { voucherDetail } = useVoucherDetailWithQuery();
  const [editVoucherId] = useQueryState<string>('editVoucherId');

  return (
    <div className="flex gap-2">
      {(voucherDetail || editVoucherId) && (
        <LoyaltyVoucherEditSheet
          voucherId={editVoucherId || voucherDetail?._id}
        />
      )}
    </div>
  );
};
