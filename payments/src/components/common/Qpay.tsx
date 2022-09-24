import './styles/common.css';

import * as QRCode from 'qrcode';
import { useState } from 'react';

import { gql, useMutation, useQuery } from '@apollo/client';

import { mutations, queries } from '../../graphql';
import { IQueryParams } from '../../types';

type Props = {
  descriptionValue?: string;
  paymentConfigId: string;
  query: IQueryParams
};

const QpaySection = ({
  query,
  descriptionValue,
  paymentConfigId,
}: Props) => {

  const [amount, setAmount] = useState(query.amount || '0');
  const [qr, setQr] = useState("");
  const [qrInvoiceNo, setQrInvoiceNo] = useState("");
  const [description, setDescription] = useState(descriptionValue || "");
  const [qrPaymentStatus, setQrPaymentStatus] = useState("CREATED");

  const useCheckInvoiceQuery = () => {

    const { refetch } = useQuery(gql(queries.checkInvoiceQuery), {
      variables: {
        invoiceId: qrInvoiceNo,
        paymentId: paymentConfigId
      }
    });

    return (
      <div>
        <form
          onSubmit={e => {
            e.preventDefault();
            refetch().then(response => {
              const checkInvoiceResponse = response.data.checkInvoice;
              if (!response.data.error) {
                setQrPaymentStatus(checkInvoiceResponse.invoice_status);
              } else {
                alert(response.data.error.amount.message);
              }
            });
          }}
        >
          <input type="submit" value='Check' />
        </form>
      </div>
    );

  };

  const useCreateInvoiceMutation = () => {
    const [addTodo, { loading, error }] = useMutation(gql(mutations.createInvoice));

    if (loading) { return 'Submitting...'; }
    if (error) { return `Submission error! ${error.message}`; }
    const {
      customerId, companyId, contentType, contentTypeId
    } = query;
    return (
      <div>
        <form
          onSubmit={e => {
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
                contentTypeId
              }
            }).then(response => {

              const createInvoiceResponse = response.data.createInvoice;
              const invoice = createInvoiceResponse[0];

              if (!invoice.error) {
                QRCode.toDataURL(invoice.response.qr_text).then(qrImage => {
                  setQr(qrImage);
                  setQrInvoiceNo(invoice.response.invoice_id);
                });
              } else {
                alert(invoice.error);
              }

            });

          }}
        >
          <input type="submit" value="Create invoice" />
        </form>
      </div>
    );
  }

  const RenderQpayImage = () => {

    const showQpay =
      <>
        <div className="border">

          <img src={qr} alt="" className="center" id="qpay" />
          <div>
            <label className="labelSpecial centerStatus" htmlFor="qpay">
              Status: {qrPaymentStatus}
            </label>
          </div>
          <label className="label" htmlFor="qrInvoiceNo">Qpay InvoiceNo:</label>
          <input type="text" name="qrInvoiceNo"
            value={qrInvoiceNo}
            disabled={true}
          />

          {useCheckInvoiceQuery()}
        </div>
      </>

    return qrInvoiceNo ? showQpay : null;

  }

  const onChangeDescription = (e: any) => {
    setDescription(e.target.value)
  };

  const onChangeAmount = (e: any) => {
    setAmount(e.target.value)
  };


  return (

    <div style={{ height: '30em', overflow: 'auto' }}>
      {RenderQpayImage()}
      <div className="border">
        <label className="label" htmlFor="description">Description: </label>
        <input type="text"
          value={description}
          onChange={e => onChangeDescription(e)}
          name="description" id="description"
        />
        <div>
          <label className="label" htmlFor="amount">Amount: </label>
          <input type="text"
            value={amount}
            onChange={e => onChangeAmount(e)}
            name="amount" id="amount"
          />
        </div>

        {useCreateInvoiceMutation()}
      </div>
    </div>
  )

}

export default QpaySection;