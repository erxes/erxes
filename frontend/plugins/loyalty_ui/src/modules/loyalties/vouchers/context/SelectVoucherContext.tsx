import { createContext, useContext } from 'react';
import { IVoucher } from '../types/voucher';

export type ISelectVoucherContext = {
  voucherIds: string[];
  vouchers: IVoucher[];
  setVouchers: (vouchers: IVoucher[]) => void;
  onSelect: (voucher: IVoucher) => void;
  loading: boolean;
  error: string | null;
};

export const SelectVoucherContext = createContext<ISelectVoucherContext | null>(
  null,
);

export const useSelectVoucherContext = () => {
  const context = useContext(SelectVoucherContext);
  if (!context) {
    throw new Error(
      'useSelectVoucherContext must be used within a SelectVoucherProvider',
    );
  }
  return context;
};
