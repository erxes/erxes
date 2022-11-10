import React, { useState, useEffect, FC } from 'react';
import gql from 'graphql-tag';
import { useMutation, useQuery } from 'react-apollo';
import { FORUM_SUBSCRIPTION_PRODUCTS_QUERY } from '../../../graphql/queries';
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
      invoiceAt
      invoiceId
      multiplier
      paymentConfirmed
      paymentConfirmedAt
      price
      unit
      contentType
    }
  }
`;

// App
// window.postMessage

const PaymentTest: FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [iframeSrc, setIframeSrc] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [subscriptionProductId, setSubscriptionProductId] = useState('');
  const [currentOrder, setCurrentOrder] = useState(null);

  const [mutGenInvoiceLink] = useMutation(GENERATE_INVOICE_URL, {
    onError: console.error
  });
  const [mutCreateOrder] = useMutation(CREATE_ORDER);

  const onClickPay = async () => {
    if (!currentUser) return alert('Login first');

    try {
      const createOrderRes = await mutCreateOrder({
        variables: {
          subscriptionProductId: subscriptionProductId
        },
        refetchQueries: ['ForumCpMySubscriptionOrders']
      });

      const order = createOrderRes.data.forumCpCreateSubscriptionOrder;

      const invoiceRes = await mutGenInvoiceLink({
        variables: {
          amount: order.price,
          contentType: order.contentType,
          contentTypeId: order._id,
          customerId: currentUser.erxesCustomerId
        }
      });

      setIframeSrc(invoiceRes.data.generateInvoiceUrl);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    window.addEventListener('message', event => {
      const { fromPublisher, ...rest } = event.data;

      if (fromPublisher) {
        setPaymentData(rest);
      }
    });

    return () => {
      window.removeEventListener('message', () => {});
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
