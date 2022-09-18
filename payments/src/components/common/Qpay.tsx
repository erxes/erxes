import { useState } from "react";
import { gql, useQuery, useMutation } from '@apollo/client';
import * as QRCode from 'qrcode';

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

  const useCheckInvoice = () => {

    const checkInvoiceQuery = `query checkInvoice($paymentId: String!, $invoiceId: String!) {
      checkInvoice(paymentId: $paymentId, invoiceId: $invoiceId)
    }`;

    const { loading, data = {} as any } = useQuery(gql(checkInvoiceQuery), {
      variables: {
        invoiceId: qrInvoiceNo,
        paymentId: paymentConfigId
      }
    });

    if (!loading && data) {
      const checkInvoiceResponse = data.checkInvoice;
      if (!data.error) {
        setQrPaymentStatus(checkInvoiceResponse.invoice_status);
      } else {
        alert(data.error.amount.message);
      }
    }

  };

  const useCreateQpay = () => {

    const createInvoice = `mutation createInvoice($paymentId: String!, $amount: Float!, $description: String!) {
      createInvoice(paymentId: $paymentId, amount: $amount, description: $description)
    }`;

    console.log(createInvoice);

    setQr(""); setQrInvoiceNo("")

    const [mutateFunction, { loading }] = useMutation(gql(createInvoice));

    mutateFunction({
      variables: {
        paymentId: paymentConfigId,
        amount,
        description,
        phone: '',
        customerId: '',
        companyId: ''
      }
    }).then((data) => {

      console.log(data);
      // const createInvoiceResponse = data.createInvoice;
      // const invoice = createInvoiceResponse[0];

      // if (!invoice.error) {
      //   QRCode.toDataURL(invoice.response.qr_text).then(qrImage => {
      //     setQr(qrImage);
      //     setQrInvoiceNo(invoice.response.invoice_id);
      //   });
      // } else {
      //   alert(invoice.error);
      // }
    });

    // if (!loading && data) {
    //   const createInvoiceResponse = data.createInvoice;
    //   const invoice = createInvoiceResponse[0];

    //   if (!invoice.error) {
    //     QRCode.toDataURL(invoice.response.qr_text).then(qrImage => {
    //       setQr(qrImage);
    //       setQrInvoiceNo(invoice.response.invoice_id);
    //     });
    //   } else {
    //     alert(invoice.error);
    //   }
    // }

    // return (
    //   <button
    //     onClick={() => {
    //       mutateFunction({
    //         variables: {
    //           input: {
    //             paymentId: paymentConfigId,
    //             amount,
    //             description,
    //             phone: '',
    //             customerId: '',
    //             companyId: ''
    //           },
    //         },
    //         onCompleted(data) {
    //           const createInvoiceResponse = data.createInvoice;
    //           const invoice = createInvoiceResponse[0];

    //           if (!invoice.error) {
    //             QRCode.toDataURL(invoice.response.qr_text).then(qrImage => {
    //               setQr(qrImage);
    //               setQrInvoiceNo(invoice.response.invoice_id);
    //             });
    //           } else {
    //             alert(invoice.error);
    //           }
    //         },
    //       });
    //     }}>
    //     Create invoice
    //   </button>
    // )
  };

  const useCreateInvoiceMutation = () => {
    const createInvoice = `mutation createInvoice($paymentId: String!, $amount: Float!, $description: String!) {
      createInvoice(paymentId: $paymentId, amount: $amount, description: $description)
    }`;
    const [addTodo, { data, loading, error }] = useMutation(gql(createInvoice));

    if (loading) { return 'Submitting...'; }
    if (error) { return `Submission error! ${error.message}`; }

    console.log("dataaa:", data)

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

              console.log(response.data)

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
          <button type="submit">Create invoice</button>
        </form>
      </div>
    );
  }

  const onChangeDescription = (e: any) => {
    setDescription(e.target.value)
  };

  const onChangeAmount = (e: any) => {
    setAmount(e.target.value)
  };


  return (
    <>
      {/* <input type="text" value={paymentConfigId} /> */}
      <div>
        <label>Description: </label>
        <input type="text"
          value={description}
          onChange={e => onChangeDescription(e)}
        />
      </div>
      <div>
        <label>Amount: </label>
        <input type="text"
          value={amount}
          onChange={e => onChangeAmount(e)}
        />
      </div>

      {useCreateInvoiceMutation()}

      {
        qrInvoiceNo !== '' && (
          <>
            <img src={qr} alt="" width="150px" />
            <label>
              Status: {qrPaymentStatus}
            </label>
            <label>Qpay InvoiceNo</label>
            <input type="text"
              value={qrInvoiceNo}
            />
            <input type="button"
              onClick={() => useCheckInvoice}
              value="Check"
            />
          </>
        )
      }
    </>
  )

}

export default QpaySection;