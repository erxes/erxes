import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import Loader from '../common/Loader';
import Component from '../components/Payments';

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
    }
  }
`;

type Props = {
  invoiceId: string;
  appToken: string;
};

const Payments = (props: Props) => {
  const { appToken, invoiceId } = props;

  const context = {
    headers: {
      'erxes-app-token': appToken,
    },
  };

  const { data, loading } = useQuery(PAYMENTS_QRY, {
    context,
  });

  const invoiceDetailQuery = useQuery(INVOICE, {
    variables: { id: invoiceId },
    context,
  });

  if (loading || invoiceDetailQuery.loading) {
    return <Loader />;
  }

  console.log('invoiceDetail = ', invoiceDetailQuery.data);

  if (invoiceDetailQuery.error) {
    return <div>{invoiceDetailQuery.error.message}</div>;
  }

  const invoiceDetail = invoiceDetailQuery.data
    ? invoiceDetailQuery.data.invoiceDetail
    : null;

  const updatedProps = {
    ...props,
    invoiceDetail,
    payments: data.payments,
  };

  return <Component {...updatedProps} />;
};

export default Payments;
