import React from 'react';
import { useQuery, useMutation, gql, useSubscription } from '@apollo/client';
import Spinner from '../common/Spinner';
import Component from '../components/Payments';
import Loader from '../common/Loader';

const INVOICE_SUBSCRIPTION = gql`
  subscription invoiceUpdated($invoiceId: String!) {
    invoiceUpdated(_id: $invoiceId)
  }
`;

const TRANSACTION_SUBSCRIPTION = gql`
  subscription transactionUpdated($invoiceId: String!) {
    transactionUpdated(invoiceId: $invoiceId)
  }
`;

const PAYMENTS_QRY = gql`
  query PaymentsPublic($kind: String, $ids: [String]) {
    paymentsPublic(kind: $kind, _ids: $ids) {
      _id
      kind
      name
    }
  }
`;

const INVOICE = gql`
  query InvoiceDetail($id: String!) {
    invoiceDetail(_id: $id) {
      _id
      invoiceNumber
      amount
      remainingAmount
      description
      phone
      paymentIds
      email
      redirectUri
      status
      transactions {
        _id
        amount
        paymentId
        paymentKind
        response
        status
      }
    }
  }
`;

const ADD_TRANSACTION = gql`
  mutation TransactionsAdd(
    $invoiceId: String!
    $paymentId: String!
    $amount: Float!
    $details: JSON
  ) {
    paymentTransactionsAdd(
      invoiceId: $invoiceId
      paymentId: $paymentId
      amount: $amount
      details: $details
    ) {
      _id
      amount
      invoiceId
      paymentId
      paymentKind
      status
      response
      details
    }
  }
`;

const CHECK_INVOICE = gql`
  mutation InvoicesCheck($id: String!) {
    invoicesCheck(_id: $id)
  }
`;

type Props = {
  invoiceId: string;
  apiDomain: string;
};

const Payments = (props: Props) => {
  const { invoiceId } = props;

  const { data, loading } = useQuery(PAYMENTS_QRY);

  const [checkInvoice] = useMutation(CHECK_INVOICE);

  const [addTransaction, addTransactionResponse] = useMutation(ADD_TRANSACTION);

  const invoiceSubscription = useSubscription(INVOICE_SUBSCRIPTION, {
    variables: { invoiceId }
  });

  const transactionSubscription = useSubscription(TRANSACTION_SUBSCRIPTION, {
    variables: { invoiceId }
  });

  const invoiceDetailQuery = useQuery(INVOICE, {
    variables: { id: invoiceId }
  });

  React.useEffect(() => {
    if (invoiceSubscription.data && invoiceSubscription.data.invoiceUpdated) {
      const message = {
        fromPayment: true,
        message: 'paymentSuccessfull',
        invoiceId,
        invoice: invoiceSubscription.data.invoiceUpdated,
        contentType: invoiceDetail.contentType,
        contentTypeId: invoiceDetail.contentTypeId
      };

      // check invoice status
      const res = invoiceSubscription.data.invoiceUpdated;
      if (res.status === 'paid') {
        window.alert('Payment has been successfully processed. Thank you! ');
        postMessage(message);
      }
    }

    if (
      transactionSubscription.data &&
      transactionSubscription.data.transactionUpdated
    ) {
      invoiceDetailQuery.refetch();
    }
  }, [invoiceSubscription.data, transactionSubscription.data]);

  if (loading || invoiceDetailQuery.loading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (invoiceDetailQuery.error) {
    return <div>{invoiceDetailQuery.error.message}</div>;
  }

  const invoiceDetail = invoiceDetailQuery.data
    ? invoiceDetailQuery.data.invoiceDetail
    : null;

  const requestNewTransaction = (paymentId: string, details?: any) => {
    addTransaction({
      variables: {
        invoiceId,
        paymentId,
        details,
        amount: invoiceDetail.amount
      }
    }).then(() => {
      invoiceDetailQuery.refetch();
    });
  };

  const checkInvoiceHandler = (id: string) => {
    checkInvoice({ variables: { id } })
      .catch(e => {
        console.log(e);
      })
      .then((res: any) => {
        const status = res.data && res.data.invoicesCheck;
        invoiceDetailQuery.refetch();
        if (status !== 'paid') {
          window.alert('Not paid yet!, Please try again later.');
        } else {
          window.alert('Payment has been successfully processed. Thank you! ');
          const message = {
            fromPayment: true,
            message: 'paymentSuccessfull',
            invoiceId,
            invoice: invoiceDetail,
            contentType: invoiceDetail.contentType,
            contentTypeId: invoiceDetail.contentTypeId
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

  const newTransaction =
    addTransactionResponse.data &&
    addTransactionResponse.data.paymentTransactionsAdd;
  let payments = data.paymentsPublic || [];

  // if invoice amount is less than 100000, hide storepay
  if (invoiceDetail && invoiceDetail.amount < 100) {
    payments = payments.filter((p: any) => p.kind !== 'storepay');
  }

  if (invoiceDetail.status === 'paid') {
    // already paid
    window.alert('Payment has been successfully processed. Thank you! ');
    postMessage({
      fromPayment: true,
      message: 'paymentSuccessfull',
      invoiceId,
      invoice: invoiceDetail,
      contentType: invoiceDetail.contentType,
      contentTypeId: invoiceDetail.contentTypeId
    });

    return <div>Payment has been successfully processed. Thank you! </div>;
  }

  const updatedProps = {
    ...props,
    invoiceDetail,
    payments,
    newTransaction,
    requestNewTransaction,
    checkInvoiceHandler,
    transactionLoading: addTransactionResponse.loading
  };

  return <Component {...updatedProps} />;
};

export default Payments;
