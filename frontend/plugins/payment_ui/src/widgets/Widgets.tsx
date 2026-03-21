import { useState } from 'react';
import { PaymentContext } from './hooks/use-payment';

import StripePayment from './components/payments/Stripe';
import QrPayment from './components/payments/QrPayment';
import StorePay from './components/payments/StorePay';
import Minupay from './components/payments/Minupay';

const WidgetContent = () => {
  const params = new URLSearchParams(window.location.search);

  const kind = params.get('kind');

  const pathParts = window.location.pathname.split('/');
  const invoiceId = pathParts[pathParts.length - 1];

  if (!invoiceId) return <div>Missing invoice ID</div>;
  if (!kind) return <div>Missing payment type</div>;

  const paymentMap: Record<string, React.ComponentType<any>> = {
    stripe: StripePayment,
    qpay: QrPayment,
    storepay: StorePay,
    minupay: Minupay,
  };

  const Component = paymentMap[kind];

  if (!Component) {
    return <div>Unsupported payment type: {kind}</div>;
  }

  return <Component invoiceId={invoiceId} />;
};

const Widgets = () => {
  const params = new URLSearchParams(window.location.search);

  const paymentId = params.get('paymentId') || '';
  const kind = params.get('kind') || 'stripe';

  //  IMPORTANT: get invoiceId here too
  const pathParts = window.location.pathname.split('/');
  const invoiceId = pathParts[pathParts.length - 1] || '';

  const [apiResponse, setApiResponse] = useState<any>(null);
  const [transactionLoading, setTransactionLoading] = useState(false);

  const requestNewTransaction = async (paymentId: string) => {
    console.log('🔥 calling QPay with:', paymentId);

    setTransactionLoading(true);

    try {
      const res = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation ($input: PaymentTransactionInput!) {
              paymentTransactionsAdd(input: $input) {
                _id
                response
              }
            }
          `,
          variables: {
            input: {
              paymentId,
              invoiceId, // 🔥 REQUIRED
              amount: 1000,
            },
          },
        }),
      });

      const json = await res.json();

      console.log('🔥 FULL RESPONSE:', json);

      const response = json?.data?.paymentTransactionsAdd?.response;

      if (!response) {
        console.error('❌ No response from backend');
        setTransactionLoading(false);
        return;
      }

      setApiResponse({
        qrData: response.qrData,
        urls: response.urls || [],
      });
    } catch (err) {
      console.error('❌ ERROR:', err);
    }

    setTransactionLoading(false);
  };

  const value = {
    invoiceDetail: {} as any,
    payments: [],
    apiDomain: '',
    newTransaction: {} as any,
    requestNewTransaction,
    checkInvoiceHandler: () => {},

    isOpen: true,
    onClose: () => {},
    transaction: {} as any,

    kind,
    paymentId,

    apiResponse,
    transactionLoading,
  };

  return (
    <PaymentContext.Provider value={value}>
      <WidgetContent />
    </PaymentContext.Provider>
  );
};

export default Widgets;
