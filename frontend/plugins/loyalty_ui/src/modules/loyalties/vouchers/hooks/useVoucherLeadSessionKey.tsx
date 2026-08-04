import { useLocation } from 'react-router';
import { VoucherPath } from '~/modules/loyalties/vouchers/types/path/Voucher';
import { VOUCHER_CURSOR_SESSION_KEY } from '../constants/voucherCursorSessionKey';

export const useVoucherLeadSessionKey = () => {
  const { pathname } = useLocation();

  const isVoucher = pathname.includes(VoucherPath.Index);

  return {
    isVoucher,
    sessionKey: VOUCHER_CURSOR_SESSION_KEY,
  };
};
