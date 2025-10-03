import React, { useState, useMemo } from 'react';
import { PaymentContext } from '../hooks/use-payment';
import PaymentMethod from './PaymentMethod';
import PaymentDialog from './PaymentDialog';
import { API_URL } from '../config';

type Props = {
  invoiceDetail: any;
  payments: any;
  newTransaction: any;
  requestNewTransaction: any;
  checkInvoiceHandler: any;
  transactionLoading: any;
  checkInvoiceLoading: any;
};

const Payment = (props: Props) => {
  const { invoiceDetail, payments } = props;
  const transactions = useMemo(
    () => invoiceDetail.transactions || [],
    [invoiceDetail.transactions],
  );


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

  React.useEffect(() => {
    if (props.newTransaction) {
      setCurrentTransaction(props.newTransaction);
    }
  }, [transactions, props.newTransaction]);

  const openDialog = (payment: any) => {
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

  return (
    <main>
      <PaymentContext.Provider
        value={{
          ...props,
          apiDomain:API_URL,
          isOpen: modalIsOpen,
          onClose: () => setModalIsOpen(false),
          transaction: currentTransaction,
          kind: kind.includes('qpay') ? 'qpay' : kind,
          paymentId: currentPaymentId,
          apiResponse: currentTransaction?.response,
          name: currentTransaction?.payment?.name,
        }}
      >
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
              {payments.map((payment: any) => (
                <PaymentMethod
                  key={payment._id}
                  kind={payment.kind.includes('qpay') ? 'qpay' : payment.kind}
                  name={payment.name}
                  iconUrl={`${API_URL}/pl:payment/static/images/payments/${payment.kind}.png`}
                  onClick={() => {
                    openDialog(payment);
                  }}
                />
              ))}
              <PaymentDialog />
            </div>
          </div>
          <div className="text-right border-t border-dashed pt-3">
            <p className="text-neutral-500 text-sm">Payment Amount</p>
            <div className="font-bold text-2xl">
              {invoiceDetail.amount.toLocaleString()} {invoiceDetail.currency}
            </div>
          </div>
        </div>
      </PaymentContext.Provider>
    </main>
  );
};

export default Payment;
