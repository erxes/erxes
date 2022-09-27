import './styles/common.css';

import { gql, useMutation, useQuery } from '@apollo/client';
import * as QRCode from 'qrcode';
import { useEffect, useState } from 'react';

import client from '../../apolloClient';
import { mutations, queries } from '../../graphql';
import { IQueryParams } from '../../types';

const INVOICE_SUBSCRIPTION = gql`
  subscription invoiceUpdated($_id: String!) {
    invoiceUpdated(_id: $_id) {
      _id
      status
    }
  }
`;

type Props = {
  paymentConfigId: string;
  query: IQueryParams;
};

const QpaySection = ({ query, paymentConfigId }: Props) => {
  const [amount, setAmount] = useState(query.amount || '0');
  const [invoiceId, setInvoiceId] = useState('');
  const [qr, setQr] = useState('');
  const [qrInvoiceNo, setQrInvoiceNo] = useState('');
  const [description, setDescription] = useState(query.description || '');
  const [qrPaymentStatus, setQrPaymentStatus] = useState('CREATED');

  useEffect(() => {
    if (invoiceId) {
      client
        .subscribe({
          query: INVOICE_SUBSCRIPTION,
          variables: { _id: invoiceId },
        })
        .subscribe({
          next({ data }) {
            if (data.invoiceUpdated && data.invoiceUpdated.status === 'paid') {
              setQrPaymentStatus('paid');
            }
          },
          error(err: any) {
            console.error('err', err);
            setQrPaymentStatus('ERROR');
          },
        });
    }
  }, [invoiceId]);

  const useCheckInvoiceQuery = () => {
    const { refetch } = useQuery(gql(queries.checkInvoiceQuery), {
      variables: {
        invoiceId: qrInvoiceNo,
        paymentId: paymentConfigId,
      },
    });

    return (
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            refetch().then((response) => {
              const checkInvoiceResponse = response.data.checkInvoice;
              if (!response.data.error) {
                setQrPaymentStatus(checkInvoiceResponse.data.invoice_status);
              } else {
                alert(response.data.error.amount.message);
              }
            });
          }}
        >
          <input type='submit' value='Check' />
        </form>
      </div>
    );
  };

  const useCreateInvoiceMutation = () => {
    const [addTodo, { loading, error }] = useMutation(
      gql(mutations.createInvoice)
    );

    if (loading) {
      return 'Submitting...';
    }
    if (error) {
      return `Submission error! ${error.message}`;
    }

    const buttonText = qrInvoiceNo ? 'Reset window' : 'Create invoice';

    const { customerId, companyId, contentType, contentTypeId } = query;
    return (
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTodo({
              variables: {
                paymentId: paymentConfigId,
                amount: Number(amount),
                description,
                phone: '',
                customerId,
                companyId,
                contentType,
                contentTypeId,
              },
            }).then((response) => {
              const createInvoiceResponse = response.data.createInvoice;
              const invoice = createInvoiceResponse.data;

              if (invoice.error) {
                return alert(invoice.error);
              }

              setInvoiceId(invoice._id);

              QRCode.toDataURL(invoice.qr_text).then((qrImage) => {
                setQr(qrImage);
                setQrInvoiceNo(invoice.invoice_id);
              });
            });
          }}
        >
          {qrInvoiceNo && (
            <input
              type='button'
              onClick={(e) => {
                setQrInvoiceNo('');
              }}
              value={buttonText}
            />
          )}
          {!qrInvoiceNo && <input type='submit' value={buttonText} />}
        </form>
      </div>
    );
  };

  const RenderQpayImage = () => {
    const showQpay = (
      <>
        <div className='border'>
          <img src={qr} alt='' className='center' id='qpay' />
          <div>
            <label className='labelSpecial centerStatus' htmlFor='qpay'>
              Status: {qrPaymentStatus}
            </label>
          </div>
          <label className='label' htmlFor='qrInvoiceNo'>
            Qpay InvoiceNo:
          </label>
          <input
            type='text'
            name='qrInvoiceNo'
            value={qrInvoiceNo}
            disabled={true}
          />

          {useCheckInvoiceQuery()}
        </div>
      </>
    );

    return qrInvoiceNo ? showQpay : null;
  };

  const onChangeAmount = (e: any) => {
    setAmount(e.target.value);
  };

  return (
    <div style={{ height: '30em', overflow: 'auto' }}>
      {RenderQpayImage()}
      <div className='border'>
        <div>
          <label className='label' htmlFor='amount'>
            Amount:{' '}
          </label>
          <input
            type='text'
            value={amount}
            onChange={(e) => onChangeAmount(e)}
            name='amount'
            id='amount'
            disabled={true}
          />
        </div>

        {useCreateInvoiceMutation()}
      </div>
    </div>
  );
};

export default QpaySection;
