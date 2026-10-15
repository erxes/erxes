import { useState } from 'react';
import { IVoucher } from '../types/voucher';
import { voucherDisplayStatus } from '../utils/voucherView';
import { useVoucherActions } from './useVoucherActions';

export type TVoucherAction = 'markUsed' | 'extend' | 'cancel';

/** The one action being filled in on the detail sheet, and running it. */
export const useVoucherDetail = (voucher: IVoucher) => {
  const { cancelVoucher, markVoucherUsed, extendVoucher, loading } =
    useVoucherActions();
  const [action, setAction] = useState<TVoucherAction | null>(null);
  const [text, setText] = useState('');
  const [endDate, setEndDate] = useState<Date | undefined>();

  const status = voucherDisplayStatus(voucher);
  // A held voucher is freed only by taking it off its order, never here.
  const canAct = status === 'new';
  const canExtend = status === 'new' || status === 'onhold';

  const choose = (next: TVoucherAction | null) => {
    setAction(next);
    setText('');
    setEndDate(undefined);
  };

  const ready = action === 'extend' ? !!endDate : !!action && !!text.trim();

  const submit = async () => {
    if (!ready || !action) return;

    const done =
      action === 'extend'
        ? await extendVoucher({
            _id: voucher._id,
            endDate: (endDate as Date).toISOString(),
          })
        : action === 'cancel'
        ? await cancelVoucher({ _id: voucher._id, reason: text.trim() })
        : await markVoucherUsed({ _id: voucher._id, note: text.trim() });

    if (done) choose(null);
  };

  return {
    status,
    canAct,
    canExtend,
    action,
    choose,
    text,
    setText,
    endDate,
    setEndDate,
    ready,
    submit,
    loading,
  };
};
