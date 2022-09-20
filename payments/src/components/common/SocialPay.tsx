import { useState } from "react";
import { gql, useQuery, useMutation } from '@apollo/client';
import * as QRCode from 'qrcode';
import './styles/common.css';

type Props = {
  invoiceNoValue?: string;
  amountValue?: string;
  phoneValue?: string;
  paymentConfigId: string;
};

const SocialPaySection = ({
  invoiceNoValue,
  amountValue,
  phoneValue,
  paymentConfigId,
}: Props) => {

  const [amount, setAmount] = useState(amountValue || '0');
  const [qr, setQr] = useState("");
  const [qrInvoiceNo, setQrInvoiceNo] = useState("");
  const [phone, setPhone] = useState(phoneValue || "");
  const [spPaymentStatus, setSpPaymentStatus] = useState("CREATED");
  const [withPhone, setWithPhone] = useState(false);

  const useCheckInvoiceQuery = () => {

    const checkInvoiceQuery = `query checkInvoice($paymentId: String!, $invoiceId: String!) {
      checkInvoice(paymentId: $paymentId, invoiceId: $invoiceId)
    }`;

    console.log(checkInvoiceQuery);

    const { refetch } = useQuery(gql(checkInvoiceQuery), {
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
    const createInvoice = `mutation createInvoice($paymentId: String!, $amount: Float!, $description: String!, $phone: String, $customerId: String, $companyId: String) {
      createInvoice(paymentId: $paymentId, amount: $amount, description: $description, phone: $phone, customerId: $customerId, companyId: $companyId)
    }`;
    const [addTodo, { loading, error }] = useMutation(gql(createInvoice));

    if (loading) { return 'Submitting...'; }
    if (error) { return `Submission error! ${error.message}`; }

    const variables = {
      paymentId: paymentConfigId,
      amount: Number(amount),
      phone,
      description: 'socialPay',
      customerId: '',
      companyId: ''
    };

    console.log("useCreateInvoiceMutation variables: ", variables);

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
                  console.log(invoiceResponse[0]);
                  const invoice = invoiceResponse[0];

                  const qrText = invoice.data.qr ? invoice.data.qr : '';

                  QRCode.toDataURL(qrText).then(data => {
                    console.log('QRCode.toDataURL:', invoice.data.invoiceNo, qrText);

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
          <input type="submit" value="Create invoice" />
        </form>
      </div>
    );
  }

  // const onChangeEvent = (variable, e) => {
  //   this.setState({ ...this.state, [`${variable}`]: e.target.value });
  // };

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