import React, { useState } from 'react';
import Modal from './PaymentModal';

import '../common/styles.css';

type Props = {
  invoiceDetail: any;
  payments: any;
  apiDomain: string;
  newTransaction: any;
  transactionLoading?: boolean;
  onClickPayment: (paymentId: string) => void;
  checkInvoiceHandler: (id: string) => void;
};

const PaymentGateway = (props: Props) => {
  const { invoiceDetail } = props;
  const transactions = invoiceDetail.transactions || [];

  const [currentTransaction, setCurrentTransaction] = useState<any>(
    props.newTransaction
  );

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [kind, setKind] = useState(props.newTransaction?.paymentKind || 'default');

  const openModal = (payment) => {
    setCurrentTransaction(null);
    setKind(payment.kind);
    console.log('pisda', payment.kind);
    if (payment.kind === 'storepay') {
      setModalIsOpen(true);

      return;
    }

    const pendingTransaction = transactions.find(
      (t) => t.paymentId === payment._id && t.status === 'pending'
    );

    console.log('pendingTransaction', pendingTransaction);

    if (pendingTransaction && pendingTransaction.paymentKind === 'minupay') {
      console.log('requesting new transaction');
      props.onClickPayment(payment._id);
    } else if (pendingTransaction) {
      setCurrentTransaction(pendingTransaction);
    } else {
      props.onClickPayment(payment._id);
    }

    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const { payments } = props;

  React.useEffect(() => {
    if (props.newTransaction) {
      setCurrentTransaction(props.newTransaction);
    }
  }, [transactions, props.newTransaction]);

  const renderPayment = (payment) => {
    return (
      <button
        key={payment._id}
        className="button"
        type="button"
        onClick={() => {
          openModal(payment);
        }}
      >
        <img
          src={`${props.apiDomain}/pl:payment/static/images/payments/${payment.kind}.png`}
          alt={payment.kind}
        />
        <div className="payment-name">
          <p>{`${payment.kind} - ${payment.name}`}</p>
        </div>
      </button>
    );
  };

  return (
    <div id="root">
      <div className="my-layout">
        <div className="header">
          Payment methods
          <h1 style={{ fontSize: '16px', color: 'grey' }}>
            Choose your payment method
          </h1>
        </div>
        <div className="paymentContainer">
          {payments.map((payment) => renderPayment(payment))}
        </div>
        <div className="block amount">
          <h4>Payment amount</h4>
          <h2 className="amount-total" id="payment-amount">
            {invoiceDetail.amount} ₮
          </h2>
        </div>
      </div>
      <Modal
        {...props}
        isOpen={modalIsOpen}
        onClose={closeModal}
        transaction={currentTransaction}
        kind={kind}
      />
    </div>
  );
};

export default PaymentGateway;
