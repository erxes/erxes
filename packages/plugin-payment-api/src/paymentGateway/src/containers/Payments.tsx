import React from 'react';
import { useQuery, useMutation, gql, useSubscription } from '@apollo/client';
import Spinner from '../common/Spinner';
import Component from '../components/Payments';

const SUBSCRIPTION = gql`
  subscription invoiceUpdated($invoiceId: String!) {
    invoiceUpdated(_id: $invoiceId)
  }
`;

const PAYMENTS_QRY = gql`
  query Payments($status: String) {
    payments(status: $status) {
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
    transactionsAdd(
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

  const subscription = useSubscription(SUBSCRIPTION, {
    variables: { invoiceId },
  });

  const invoiceDetailQuery = useQuery(INVOICE, {
    variables: { id: invoiceId },
  });

  React.useEffect(() => {
    if (subscription.data && subscription.data.invoiceUpdated) {
      // check invoice status
      const res = subscription.data.invoiceUpdated;
      if (res.status === 'paid') {
        window.alert('Payment has been successfully processed. Thank you! ');
        postMessage();
      }
    }
  }, [subscription.data]);

  if (loading || invoiceDetailQuery.loading) {
    return <Spinner />;
  }

  if (invoiceDetailQuery.error) {
    return <div>{invoiceDetailQuery.error.message}</div>;
  }

  const invoiceDetail = invoiceDetailQuery.data
    ? invoiceDetailQuery.data.invoiceDetail
    : null;

  const requestNewTransaction = (paymentId: string, details?: any ) => {
    addTransaction({
      variables: {
        invoiceId,
        paymentId,
        details,
        amount: invoiceDetail.amount,
      },
    }).then(() => {
      invoiceDetailQuery.refetch();
    });
  };

  const checkInvoiceHandler = (id: string) => {
    checkInvoice({ variables: { id } })
      .catch((e) => {
        console.log(e);
      })
      .then((res: any) => {
        const status = res.data && res.data.invoicesCheck;
        if (status !== 'paid') {
          window.alert('Not paid yet!, Please try again later.');
        } else {
          window.alert('Payment has been successfully processed. Thank you! ');
          postMessage();
        }
      });
  };

  const postMessage = () => {
    const message = {
      fromPayment: true,
      message: 'paymentSuccessfull',
      invoiceId,
      contentType: invoiceDetail.contentType,
      contentTypeId: invoiceDetail.contentTypeId,
    };

    if (window.opener) {
      window.opener.postMessage(message, '*');
    }

    if (window.parent) {
      window.parent.postMessage(message, '*');
    }
  };

  const newTransaction = addTransactionResponse.data && addTransactionResponse.data.transactionsAdd;
  let payments = data.payments || [];

  // if invoice amount is less than 100000, hide storepay
  if (invoiceDetail && invoiceDetail.amount < 100000) {
    payments = payments.filter((p: any) => p.kind !== 'storepay');
  }

  const updatedProps = {
    ...props,
    invoiceDetail,
    payments,
    newTransaction,
    requestNewTransaction,
    checkInvoiceHandler,
    transactionLoading: addTransactionResponse.loading,
  };

  return <Component {...updatedProps} />;
};

export default Payments;
