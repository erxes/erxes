import React from 'react';
import Component from '../components/PaymentModal';
import { useQuery, useMutation, gql } from '@apollo/client';
import Loader from '../common/Loader';

const INVOICE_UPDATE = gql`
  mutation InvoiceSelectPayment($id: String!, $paymentId: String!) {
    invoiceSelectPayment(_id: $id, paymentId: $paymentId) {
      _id
      apiResponse
      status
      errorDescription
      amount
      payment {
        kind
        name
        _id
      }
    }
  }
`;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  invoiceId: string;
};

const PaymentModal = (props: Props) => {
  const [invoice, setInvoice] = React.useState(null);

  React.useEffect(() => {
    if (props.paymentId) {
      setPaymentMethod({
        variables: {
          id: props.invoiceId,
          paymentId: props.paymentId,
        },
      })
        .then((res) => {
          setInvoice(res.data.invoiceSelectPayment);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [props.paymentId]);

  const [setPaymentMethod, { loading, error }] = useMutation(INVOICE_UPDATE);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>Error! {error.message}</div>;
  }

  const updatedProps = {
    ...props,
    invoice,
  };

  return <Component {...updatedProps} />;
};

export default PaymentModal;
