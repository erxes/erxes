import { createContext, useContext } from 'react';

import { Payment } from '@/payments/hooks/usePayments';

export type ISelectPaymentContext = {
  paymentIds: string[];
  onSelect: (payment: Payment | null) => void;
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  loading: boolean;
  mode?: 'single' | 'multiple';
  removeId?: (id: string) => void;
};

export const SelectPaymentContext = createContext<ISelectPaymentContext | null>(
  null,
);

export const useSelectPaymentContext = () => {
  const context = useContext(SelectPaymentContext);
  if (!context) {
    throw new Error(
      'useSelectPaymentContext must be used within a SelectPaymentProvider',
    );
  }
  return context;
};
