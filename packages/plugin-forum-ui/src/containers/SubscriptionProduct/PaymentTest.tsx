import React, { useState, FC } from 'react';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo';

const MUTATION = gql`
  mutation GenerateInvoiceUrl(
    $amount: Float!
    $contentType: String
    $contentTypeId: String
    $customerId: String
  ) {
    generateInvoiceUrl(
      amount: $amount
      contentType: $contentType
      contentTypeId: $contentTypeId
      customerId: $customerId
    )
  }
`;

// App
// window.postMessage

const PaymentTest: FC = () => {
  const [orderId, setOrderId] = useState('');

  const [mutGenInvoiceLink] = useMutation(MUTATION);

  const onClick = async () => {
    const response = await mutGenInvoiceLink({
      variables: {
        amount: 1,
        contentType: 'forum:forum_subscription_orders',
        contentTypeId: orderId,
        customerId: 'qiDCqxD5M5u9v4StS'
      }
    });
    alert(JSON.stringify(response, null, 2));
  };

  return (
    <div style={{ border: '2px solid red' }}>
      <h1>Payment test</h1>

      <input
        type="text"
        value={orderId}
        onChange={e => setOrderId(e.target.value)}
      />
      <button type="button" onClick={onClick}>
        Pay
      </button>
    </div>
  );
};

export default PaymentTest;
