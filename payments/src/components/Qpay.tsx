import { useState } from "react";
import * as QRCode from "qrcode";
import { IPaymentParams } from "../types";

// const INVOICE_SUBSCRIPTION = gql`
//   subscription invoiceUpdated($_id: String!) {
//     invoiceUpdated(_id: $_id) {
//       _id
//       status
//     }
//   }
// `;

type Props = {
  params: IPaymentParams;
  invoice?: any;
};

const QpaySection = (props: Props) => {
  const { params, invoice } = props;

  const [amount, setAmount] = useState(params.amount || "0");
  const [qr, setQr] = useState("");
  const [description, setDescription] = useState(params.description || "");

  const generateQrCode = (text: string) => {
    QRCode.toDataURL(text).then(qrImage => {
      setQr(qrImage);
    });
  };

  if (invoice && invoice.qrText) {
    generateQrCode(invoice.qrText);
  }

  const renderQR = () => {
    if (!props.invoice) {
      return null;
    }

    return (
      <>
        <div className="border">
          <img src={qr} alt="" className="center" id="qpay" />
          <div>
            <label className="labelSpecial centerStatus" htmlFor="qpay">
              Status: {invoice && invoice.status}
            </label>
          </div>
        </div>
      </>
    );
  };

  const onChange = (e: any) => {
    if (e.target._id === "amount") {
      return setAmount(e.target.value);
    }

    setDescription(e.target.value);
  };

  return (
    <div style={{ height: "30em", overflow: "auto" }}>
      {renderQR()}

      {invoice && invoice.qrText ? null : (
        <div className="border">
          <div>
            <label className="label" htmlFor="amount">
              Amount:{" "}
            </label>
            <input
              type="text"
              value={amount}
              onChange={e => onChange(e)}
              name="amount"
              id="amount"
              disabled={true}
            />
            <label className="label" htmlFor="description">
              Description:{" "}
            </label>
            <input
              type="text"
              value={description}
              onChange={e => onChange(e)}
              name="description"
              id="description"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QpaySection;
