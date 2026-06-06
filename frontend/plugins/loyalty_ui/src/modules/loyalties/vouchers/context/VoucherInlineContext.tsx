import { createContext, useContext } from 'react';
import { IVoucher } from '../types/voucher';

export interface IVoucherInlineContext {
  vouchers: IVoucher[];
  loading: boolean;
  voucherIds?: string[];
  placeholder: string;
  updateVoucher?: (vouchers: IVoucher[]) => void;
}

export const VoucherInlineContext = createContext<IVoucherInlineContext | null>(
  null,
);

export const useVoucherInlineContext = () => {
  const context = useContext(VoucherInlineContext);
  if (!context) {
    throw new Error(
      'useVoucherInlineContext must be used within a VoucherInlineProvider',
    );
  }
  return context;
};
