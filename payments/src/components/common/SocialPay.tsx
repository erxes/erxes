import './styles/common.css';

import * as QRCode from 'qrcode';
import { useState } from 'react';

import { gql, useMutation, useQuery } from '@apollo/client';

import { mutations, queries } from '../../graphql';
import { IQueryParams } from '../../types';

type Props = {
  phoneValue?: string;
  paymentConfigId: string;
  query: IQueryParams
};

const SocialPaySection = ({
  query,
  phoneValue,
  paymentConfigId,
}: Props) => {

  const [amount, setAmount] = useState(query.amount || '0');
  const [qr, setQr] = useState("");
  const [qrInvoiceNo, setQrInvoiceNo] = useState("");
  const [phone, setPhone] = useState(phoneValue || "");
  const [spPaymentStatus, setSpPaymentStatus] = useState("CREATED");
  const [withPhone, setWithPhone] = useState(false);

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

              const status =
                checkInvoiceResponse.header.code === 200 &&
                  checkInvoiceResponse.body.response.resp_desc &&
                  checkInvoiceResponse.body.response.resp_desc === 'Амжилттай'
                  ? 'paid'
                  : 'open';

              if (!checkInvoiceResponse.error && checkInvoiceResponse.header.code) {
                setSpPaymentStatus(status);
              } else {
                alert(checkInvoiceResponse.error);
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

    const buttonText = qrInvoiceNo ? "Reset window" : "Create invoice";

    const {
      customerId, companyId, contentType, contentTypeId
    } = query;
    const variables = {
      paymentId: paymentConfigId,
      amount: Number(amount),
      phone,
      description: 'socialPay',
      customerId,
      companyId,
      contentType,
      contentTypeId
    };

    return (
      <div>
        <form
          onSubmit={e => {
            e.preventDefault();
            addTodo({
              variables
            }).then(response => {
              const invoiceResponse = response.data.createInvoice;

              if (!invoiceResponse.error) {
                setSpPaymentStatus('created');

                if (!withPhone) {
                  const invoice = invoiceResponse[0];

                  const qrText = invoice.data.qr ? invoice.data.qr : '';

                  QRCode.toDataURL(qrText).then(data => {

                    setQr(data);
                    setQrInvoiceNo(invoice.data.invoiceNo);
                  });
                }
              } else {
                alert(invoiceResponse.error);
              }
            }).catch(createError => {
              alert(createError);
            });
          }}
        >
          {
            qrInvoiceNo && (
              <input type="button" onClick={e => { setQrInvoiceNo("") }} value={buttonText} />
            )
          }
          {
            !qrInvoiceNo && (
              <input type="submit" value={buttonText} />
            )
          }
        </form>
      </div>
    );
  }

  const RenderSocialPayImage = () => {
    const showSocialPay =
      <>
        <div className="border">

          {
            withPhone === false && (
              <img src={qr} alt="" width="150px" className="center" id="qpay" />
            )}

          <div>
            <label className="labelSpecial centerStatus">
              Status: {spPaymentStatus}
            </label>
          </div>
          <label className="label" htmlFor="qrInvoiceNo">SocialPay InvoiceNo:</label>
          <input type="text" name="qrInvoiceNo"
            value={qrInvoiceNo}
            disabled={true}
          />

          {useCheckInvoiceQuery()}
        </div>
      </>

    return qrInvoiceNo ? showSocialPay : null;

  }

  const onChangeAmount = (e: any) => {
    setAmount(e.target.value)
  };

  const onClickEventWithPhone = (e: any) => {
    const value = e.target.checked;
    setWithPhone(value);
    if (value === false) {
      setPhone('');
    }
  };

  const onChangePhone = (e: any) => {
    setPhone(e.target.value);
  };


  return (

    <div style={{ height: '30em', overflow: 'auto' }}>
      {RenderSocialPayImage()}
      <div className="border">
        <div style={{ marginBottom: "5px" }}>
          <label className="label" htmlFor="withPhone">SocialPay phone:</label>
          <input type="checkbox" onClick={onClickEventWithPhone} id="withPhone" name="withPhone" />
        </div>
        {withPhone && <>
          <label className="label">Registered phone:</label>
          <input type="text" value={phone} onChange={onChangePhone} />
        </>
        }
        <label className="label" htmlFor="amount">Amount: </label>
        <input type="text"
          value={amount}
          onChange={e => onChangeAmount(e)}
          name="amount" id="amount"
        />
      </div>

      {useCreateInvoiceMutation()}
    </div>
  )

}

export default SocialPaySection;