import React, { createContext, useContext, useState } from 'react';
import Modal from './PaymentModal';

import PaymentType from './PaymentType';

type Props = {
  invoiceDetail: any;
  payments: any;
  apiDomain: string;
  newTransaction: any;
  transactionLoading?: boolean;
  checkInvoiceLoading?: boolean;
  requestNewTransaction: (paymentId: string, details?: any) => void;
  checkInvoiceHandler: (id: string) => void;
};

type ContextProps = Props & {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
  kind: string;
  name?: string;
  paymentId: string;
  apiResponse?: any;
};

const PaymentContext = createContext<ContextProps | null>(null);

export function usePayment() {
  const context = useContext(PaymentContext);

  if (!context) {
    throw new Error('usePayment must be used within a <PaymentGateway />');
  }

  return context;
}

const PaymentGateway = (props: Props) => {
  const { invoiceDetail } = props;
  const transactions = invoiceDetail.transactions || [];

  const [currentTransaction, setCurrentTransaction] = useState<any>(
    props.newTransaction,
  );

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [kind, setKind] = useState(
    props.newTransaction?.paymentKind || 'default',
  );
  const [currentPaymentId, setCurrentPaymentId] = useState(
    props.newTransaction?.paymentId || '',
  );

  const openModal = (payment) => {
    setCurrentPaymentId(payment._id);
    setCurrentTransaction(null);
    setKind(payment.kind);

    if (payment.kind !== 'storepay') {
      const pendingTransaction = transactions.find(
        (t) => t.paymentId === payment._id && t.status === 'pending',
      );

      if (pendingTransaction && pendingTransaction.paymentKind === 'minupay') {
        props.requestNewTransaction(payment._id);
      } else if (
        pendingTransaction &&
        pendingTransaction.paymentKind === 'golomt'
      ) {
        // request new transaction for golomt if the transaction is older than 7 minutes
        const now = new Date();
        const sevenMinutesAgo = new Date(now.getTime() - 7 * 60 * 1000);
        const isWithinPastSevenMinutes =
          new Date(pendingTransaction.createdAt) >= sevenMinutesAgo;

        if (!isWithinPastSevenMinutes) {
          props.requestNewTransaction(payment._id);
        }
      } else if (pendingTransaction) {
        setCurrentTransaction(pendingTransaction);
      } else {
        props.requestNewTransaction(payment._id);
      }
    }

    setModalIsOpen(true);
  };

  const closeModal = () => setModalIsOpen(false);

  const { payments } = props;

  React.useEffect(() => {
    if (props.newTransaction) {
      setCurrentTransaction(props.newTransaction);
    }
  }, [transactions, props.newTransaction]);

  const renderPayment = (payment) => {
    return (
      <PaymentType
        key={payment._id}
        type={payment.kind}
        url={`${props.apiDomain}/pl:payment/static/images/payments/${payment.kind}.png`}
        name={`${payment.kind} - ${payment.name}`}
        onClick={() => {
          openModal(payment);
        }}
      />
    );
  };

  return (
    <main>
      <div className="md:fixed md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 p-4 md:px-6 md:border border-neutral-500/10 bg-white md:rounded-lg md:shadow-lg w-full max-w-3xl ">
        <header className="border-b pb-3 border-dashed">
          <h2 className="font-semibold text-lg leading-snug">
            Payment methods
          </h2>
          <div className="text-xs text-neutral-500">
            Choose your payment method
          </div>
        </header>
        <div className="min-h-48">
          <div className="pt-4 pb-8 grid md:grid-cols-2 gap-4 ">
            {payments.map((payment) => renderPayment(payment))}
          </div>
        </div>
        <div className="text-right border-t border-dashed pt-3">
          <p className="text-neutral-500 text-sm">Payment Amount</p>
          <div className="font-bold text-2xl">
            {invoiceDetail.amount.toLocaleString()} {invoiceDetail.currency}
          </div>
        </div>
      </div>
      <PaymentContext.Provider
        value={{
          ...props,
          isOpen: modalIsOpen,
          onClose: closeModal,
          transaction: currentTransaction,
          kind: kind.includes('qpay') ? 'qpay' : kind,
          paymentId: currentPaymentId,
          apiResponse: currentTransaction?.response,
          name: currentTransaction?.payment?.name,
        }}
      >
        <Modal />
      </PaymentContext.Provider>
    </main>
  );
};

export default PaymentGateway;
