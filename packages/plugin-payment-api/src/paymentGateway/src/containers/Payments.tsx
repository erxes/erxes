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

const INVOICE_ADD = gql`
  mutation InvoiceCreate(
    $amount: Float!
    $selectedPaymentId: String
    $phone: String
    $email: String
    $description: String
    $customerId: String
    $customerType: String
    $contentType: String
    $contentTypeId: String
    $couponCode: String
    $couponAmount: Int
    $data: JSON
  ) {
    invoiceCreate(
      amount: $amount
      selectedPaymentId: $selectedPaymentId
      phone: $phone
      email: $email
      description: $description
      customerId: $customerId
      customerType: $customerType
      contentType: $contentType
      contentTypeId: $contentTypeId
      couponCode: $couponCode
      couponAmount: $couponAmount
      data: $data
    ) {
      _id
      apiResponse
      idOfProvider
      errorDescription
      paymentKind
      status
      amount
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

  const [createInvoiceMutation, mutationStates] = useMutation(INVOICE_ADD);

  if (loading || mutationStates.loading || invoiceDetailQuery.loading) {
    return <Loader />;
  }

  console.log('invoiceDetail = ', invoiceDetailQuery.data);

  if (invoiceDetailQuery.error) {
    return <div>{invoiceDetailQuery.error.message}</div>;
  }





  const createInvoice = (paymentId: string) => {
    createInvoiceMutation({
      variables: { selectedPaymentId: paymentId },
    })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const invoiceDetail = invoiceDetailQuery.data ? invoiceDetailQuery.data.invoiceDetail : null;

  const updatedProps = {
    ...props,
    invoiceDetail,
    payments: data.payments,
    createInvoice,
  };

  return <Component {...updatedProps} />;
};

export default Payments;
