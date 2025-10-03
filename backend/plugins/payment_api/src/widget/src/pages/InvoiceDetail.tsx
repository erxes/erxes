import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import Payment from '../components/Payment';
import {
  ADD_TRANSACTION,
  CHECK_INVOICE,
  INVOICE,
  INVOICE_SUBSCRIPTION,
  PAYMENTS_QRY,
  TRANSACTION_SUBSCRIPTION
} from '../lib/graphql';
import React from 'react';

const InvoiceDetail = () => {
  const { id } = useParams();
  const [checkInvoice, { loading: checkInvoiceLoading }] =
    useMutation(CHECK_INVOICE);

  const [addTransaction, addTransactionResponse] = useMutation(ADD_TRANSACTION);

  const invoiceSubscription = useSubscription(INVOICE_SUBSCRIPTION, {
    variables: { invoiceId: id },
  });

  const transactionSubscription = useSubscription(TRANSACTION_SUBSCRIPTION, {
    variables: { invoiceId: id },
  });

  const invoiceDetailQuery = useQuery(INVOICE, {
    variables: { id },
  });

  const invoiceDetail = invoiceDetailQuery.data?.invoiceDetail || null;

  const { data, loading: paymentsLoading } = useQuery(PAYMENTS_QRY, {
    skip: !invoiceDetail,
    variables: {
      ...(invoiceDetail?.paymentIds?.length > 0 && {
        ids: invoiceDetail?.paymentIds,
      }),
      currency: invoiceDetail?.currency || '',
    },
  });

  React.useEffect(() => {
    if (invoiceSubscription.data?.invoiceUpdated) {
      const message = {
        fromPayment: true,
        message: 'paymentSuccessful',
        invoiceId: id,
        invoice: invoiceSubscription.data.invoiceUpdated,
        contentType: invoiceDetail.contentType,
        contentTypeId: invoiceDetail.contentTypeId,
      };

      const res = invoiceSubscription.data.invoiceUpdated;
      if (res.status === 'paid') {
        window.alert('Payment has been successfully processed. Thank you!');
        postMessage(message);
      }
    }

    if (transactionSubscription.data?.transactionUpdated) {
      invoiceDetailQuery.refetch();
    }
  }, [invoiceSubscription.data, transactionSubscription.data]);

  if (invoiceDetailQuery.loading || paymentsLoading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (invoiceDetailQuery.error) {
    return <div>{invoiceDetailQuery.error.message}</div>;
  }

  const requestNewTransaction = (paymentId: string, details?: any) => {
    addTransaction({
      variables: { input: {
        invoiceId: id,
        paymentId,
        details,
        amount: invoiceDetail.amount,
      } }
    }).then(() => {
      invoiceDetailQuery.refetch();
    });
  };

  const checkInvoiceHandler = (id: string) => {
    checkInvoice({ variables: { id } })
      .catch((e) => {
        console.error(e);
      })
      .then(({ data }: any) => {
        const status = data?.invoicesCheck;
        invoiceDetailQuery.refetch();
        if (status !== 'paid') {
          window.alert('Not paid yet!, Please try again later.');
        } else {
          window.alert('Payment has been successfully processed. Thank you!');
          const message = {
            fromPayment: true,
            message: 'paymentSuccessful',
            invoiceId: id,
            invoice: invoiceDetail,
            contentType: invoiceDetail.contentType,
            contentTypeId: invoiceDetail.contentTypeId,
          };
          postMessage(message);
        }
      });
  };

  const postMessage = (message: any) => {
    if (window.opener) {
      window.opener.postMessage(message, '*');
    }

    if (window.parent) {
      window.parent.postMessage(message, '*');
    }
  };

  const { paymentTransactionsAdd: newTransaction } =
    addTransactionResponse.data || {};
  let payments = data?.paymentsPublic || [];

  // if invoice amount is less than 100000, hide storepay
  if (invoiceDetail && invoiceDetail.amount < 100000) {
    payments = payments.filter((p: any) => p.kind !== 'storepay');
  }

  if (invoiceDetail.status === 'paid') {
    window.alert('Payment has been successfully processed. Thank you!');
    postMessage({
      fromPayment: true,
      message: 'paymentSuccessful',
      invoiceId: id,
      invoice: invoiceDetail,
      contentType: invoiceDetail.contentType,
      contentTypeId: invoiceDetail.contentTypeId,
    });

    return (
      <div className="py-12 flex items-center justify-center">
        Payment has been successfully processed. Thank you!
      </div>
    );
  }

  const updatedProps = {
    invoiceDetail,
    payments,
    newTransaction,
    requestNewTransaction,
    checkInvoiceHandler,
    transactionLoading: addTransactionResponse.loading,
    checkInvoiceLoading,
  };

  return <Payment {...updatedProps} />;
};

export default InvoiceDetail;
