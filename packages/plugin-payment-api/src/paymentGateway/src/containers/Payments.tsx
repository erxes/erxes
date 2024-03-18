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
      amount
      apiResponse
      customerId
      data
      description
      errorDescription
      idOfProvider
      paymentId
      paymentKind
      status
      contentType
      contentTypeId
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

  const updatedProps = {
    ...props,
    invoiceDetail,
    payments: data.payments,
    checkInvoiceHandler,
  };

  return <Component {...updatedProps} />;
};

export default Payments;
