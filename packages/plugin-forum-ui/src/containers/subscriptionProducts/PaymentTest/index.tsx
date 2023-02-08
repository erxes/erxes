import React, { useState, useEffect, FC } from 'react';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo';
import CpLogin from './CpLogin';
import CurrentUser from './CurrentUser';
import ChooseProduct from './ChooseProduct';
import CpUserOrderList from './CpUserOrderList';

const GENERATE_INVOICE_URL = gql`
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

const CREATE_ORDER = gql`
  mutation ForumCpCreateSubscriptionOrder($subscriptionProductId: ID!) {
    forumCpCreateSubscriptionOrder(
      subscriptionProductId: $subscriptionProductId
    ) {
      _id
      cpUserId
      createdAt
      state
      price
      multiplier
      invoiceId
      contentType
      unit
    }
  }
`;

const PAYMENT_SUCCESS = gql`
  mutation ForumCpCompleteSubscriptionOrder(
    $invoiceId: ID!
    $subscriptionOrderId: ID!
  ) {
    forumCpCompleteSubscriptionOrder(
      invoiceId: $invoiceId
      subscriptionOrderId: $subscriptionOrderId
    )
  }
`;

// App
// window.postMessage

const PaymentTest: FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [iframeSrc, setIframeSrc] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [subscriptionProductId, setSubscriptionProductId] = useState('');
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  const [mutGenInvoiceLink] = useMutation(GENERATE_INVOICE_URL, {
    onError: console.error
  });
  const [mutCreateOrder] = useMutation(CREATE_ORDER);
  const [mutPaymentSuccess] = useMutation(PAYMENT_SUCCESS, {
    refetchQueries: ['ForumCpMySubscriptionOrders', 'ClientPortalCurrentUser']
  });

  const onClickPay = async () => {
    if (!currentUser) {
      return alert('Login first');
    }

    try {
      const createOrderRes = await mutCreateOrder({
        variables: {
          subscriptionProductId: subscriptionProductId
        },
        refetchQueries: ['ForumCpMySubscriptionOrders']
      });

      const order = createOrderRes.data.forumCpCreateSubscriptionOrder;

      setCurrentOrder(order);

      const invoiceRes = await mutGenInvoiceLink({
        variables: {
          amount: order.price,
          contentType: order.contentType,
          contentTypeId: order._id,
          customerId: currentUser.erxesCustomerId
        }
      });

      setIframeSrc(invoiceRes.data.generateInvoiceUrl);
      // window.open(
      //   invoiceRes.data.generateInvoiceUrl,
      //   'popup',
      //   'width=1280,height=720'
      // );
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const onMessage = async event => {
      const { fromPayment, message, invoiceId, contentTypeId } = event.data;

      if (fromPayment) {
        if (message === 'paymentSuccessfull') {
          await mutPaymentSuccess({
            variables: {
              invoiceId,
              subscriptionOrderId: contentTypeId
            }
          });
          alert('success');

          setIframeSrc('');
        }
      }
    };

    window.addEventListener('message', onMessage);

    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, []);

  return (
    <div style={{ border: '2px solid red' }}>
      <h1>Payment test</h1>

      <CpLogin />

      <CurrentUser userChange={setCurrentUser} />

      <CpUserOrderList />

      <h1>Current order</h1>
      <pre>{JSON.stringify(currentOrder, null, 2)}</pre>

      <h1>Payment data</h1>
      <pre>{JSON.stringify(paymentData, null, 2)}</pre>

      <ChooseProduct
        value={subscriptionProductId}
        onChange={setSubscriptionProductId}
      />

      <button type="button" onClick={onClickPay}>
        Pay
      </button>

      <iframe src={iframeSrc} style={{ width: '100%', height: '500px' }} />
      <br />
    </div>
  );
};

export default PaymentTest;
