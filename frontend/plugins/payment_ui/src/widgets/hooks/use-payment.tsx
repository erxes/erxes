import { useContext, createContext } from "react";
import type { Invoice, Payment, Transaction } from "../types";

type Props = {
    invoiceDetail: Invoice;
    payments: Payment[];
    apiDomain: string;
    newTransaction: Transaction;
    transactionLoading?: boolean;
    checkInvoiceLoading?: boolean;
    requestNewTransaction: (paymentId: string, details?: any) => void;
    checkInvoiceHandler: (id: string) => void;
  };

type ContextProps = Props & {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction;
    kind: string;
    name?: string;
    paymentId: string;
    apiResponse?: any;
  };

export const PaymentContext = createContext<ContextProps | null>(null)

export const usePayment = () => {
    const context = useContext(PaymentContext);

    if (!context) {
        throw new Error('usePayment must be used within a PaymentProvider')
    }

    return context
};
