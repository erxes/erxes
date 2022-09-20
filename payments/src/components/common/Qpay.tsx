import { useState } from "react";
import { gql, useQuery, useMutation } from '@apollo/client';
import * as QRCode from 'qrcode';
import './styles/common.css';

type Props = {
  invoiceNoValue?: string;
  amountValue?: string;
  descriptionValue?: string;
  paymentConfigId: string;
};

const QpaySection = ({
  invoiceNoValue,
  amountValue,
  descriptionValue,
  paymentConfigId,
}: Props) => {

  // const [invoiceNo, setInvoiceNo] = useState(invoiceNoValue || "")
  const [amount, setAmount] = useState(amountValue || '0');
  const [qr, setQr] = useState("");
  const [qrInvoiceNo, setQrInvoiceNo] = useState("");
  const [description, setDescription] = useState(descriptionValue || "");
  const [qrPaymentStatus, setQrPaymentStatus] = useState("CREATED");
  // const [type, setType] = useState("qpay");

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
    const createInvoice = `mutation createInvoice($paymentId: String!, $amount: Float!, $description: String!, $phone: String, $customerId: String, $companyId: String) {
      createInvoice(paymentId: $paymentId, amount: $amount, description: $description, phone: $phone, customerId: $customerId, companyId: $companyId)
    }`;
    const [addTodo, { loading, error }] = useMutation(gql(createInvoice));

    if (loading) { return 'Submitting...'; }
    if (error) { return `Submission error! ${error.message}`; }

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
                customerId: '',
                companyId: ''
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

          <img src={qr} alt="" width="150px" className="center" id="qpay" />
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