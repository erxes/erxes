import { useState } from 'react';
import { PaymentContext } from './hooks/use-payment';

import StripePayment from './components/payments/Stripe';
import QrPayment from './components/payments/QrPayment';
import StorePay from './components/payments/StorePay';
import Minupay from './components/payments/Minupay';

// 🔒 Read URL ONCE
const getInitialParams = () => {
  const url = new URL(window.location.href);

  console.log('🚨 INITIAL URL:', url.href);

  const match = url.pathname.match(/invoice\/([^/?]+)/);
  const invoiceId = match ? decodeURIComponent(match[1]) : '';

  const kind = url.searchParams.get('kind') || 'qpay';
  const paymentId = url.searchParams.get('paymentId') || '';

  console.log('👉 INITIAL INVOICE ID:', invoiceId);
  console.log('👉 INITIAL PAYMENT ID:', paymentId);

  return { invoiceId, kind, paymentId };
};

const initial = getInitialParams();

const WidgetContent = () => {
  const { invoiceId, kind } = initial;

  if (!invoiceId) return <div>Missing invoice ID</div>;

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
  const { invoiceId, kind, paymentId } = initial;

  const [apiResponse, setApiResponse] = useState<any>(null);
  const [transactionLoading, setTransactionLoading] = useState(false);

  // ✅ TYPE SAFE + FLEXIBLE
  const requestNewTransaction = async (paymentIdParam?: string) => {
    const finalPaymentId = paymentIdParam || paymentId;

    console.log('🔥 calling QPay with:', finalPaymentId);
    console.log('🔥 using invoiceId:', invoiceId);

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
              paymentId: finalPaymentId,
              invoiceId,
              amount: 1000,
            },
          },
        }),
      });

      const json = await res.json();

      console.log('🔥 FULL RESPONSE:', JSON.stringify(json, null, 2));

      let response = json?.data?.paymentTransactionsAdd?.response;

      if (!response) response = json?.data?.paymentTransactionsAdd;

      if (typeof response === 'string') {
        try {
          response = JSON.parse(response);
        } catch {
          console.error('❌ Failed to parse response');
        }
      }

      if (!response) {
        console.error('❌ No usable response');
        setTransactionLoading(false);
        return;
      }

      setApiResponse({
        qrData:
          response.qrData ||
          response.qr ||
          response.qr_code ||
          response.qrcode,
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