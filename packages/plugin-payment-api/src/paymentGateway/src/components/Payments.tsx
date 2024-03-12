import React, { useState } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './YourCustomStyle.css'; // Import your custom styles if any
import '../../../public/css/style.css';

type Props = {
  payments: any;
};

const PaymentGateway = (prop: Props) => {
  const [amount, setAmount] = useState(500);

  const onPaymentClick = (paymentMethod, paymentDetails, gateway) => {
    // Implement your logic here
    console.log(
      'Payment method clicked:',
      paymentMethod,
      paymentDetails,
      gateway
    );
  };

  const { payments } = prop;

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
          {/* Replace with your actual buttons and onClick handlers */}
          {payments.map((payment, index) => (
            <button
              key={index}
              className="button"
              type="button"
              onClick={() => {
                console.log('payment', payment);
              }}
            >
              <img
                src={`/pl:payment/static/images/payments/${payment.kind}.png`}
                alt="Qpay Logo"
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
            {amount} ₮
          </h2>
        </div>
      </div>
      {/* Add your modal component here */}
      {/* Example: <PaymentModal /> */}
    </div>
  );
};

export default PaymentGateway;
