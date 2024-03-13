import React, { useState } from 'react';
import Modal from '../containers/PaymentModal';

import '../common/styles.css';

type Props = {
  invoiceDetail: any;
  payments: any;
  // onClickPayment: (paymentId: string) => void;
};

const PaymentGateway = (props: Props) => {
  const [invoice, setInvoice] = useState(props.invoiceDetail);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = (payment) => {
    setSelectedPayment(payment);
    setModalIsOpen(true);

    // props.onClickPayment(payment._id);
  };

  const closeModal = () => {
    setSelectedPayment(null);
    setModalIsOpen(false);
  };

  const { payments } = props;

  React.useEffect(() => {}, [props.invoiceDetail.apiResponse]);

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
          {payments.map((payment) => (
            <button
              key={payment._id}
              className="button"
              type="button"
              onClick={() => {
                openModal(payment);
              }}
            >
              <img
                src={`/pl:payment/static/images/payments/${payment.kind}.png`}
                alt={payment.kind}
              />
              <div className="payment-name">
                <p>{`${payment.kind} - ${payment.name}`}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="block amount">
          <h4>Payment amount</h4>
          <h2 className="amount-total" id="payment-amount">
            {invoice.amount} ₮
          </h2>
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onClose={closeModal}
        invoiceId={invoice._id}
        paymentId={selectedPayment && selectedPayment._id}
      />
    </div>
  );
};

export default PaymentGateway;
