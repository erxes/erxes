import { QRCodeSVG } from 'qrcode.react';
import * as React from 'react';
import { IInvoice, IPaymentParams, IQpayResponse } from '../types';

type Props = {
  params: IPaymentParams;
  invoice?: IInvoice;
  onChange: (key: string, value: any) => void;
};

const QpaySection = (props: Props) => {
  const { params, invoice } = props;

  const qpayResponse = invoice && (invoice.apiResponse as IQpayResponse);

  const renderQR = () => {
    if (!invoice) {
      return null;
    }

    return (
      <>
        <div className="border">
          {qpayResponse && (
            <div>
              <QRCodeSVG value={qpayResponse.qr_text} />
            </div>
          )}
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
    props.onChange(e.target.id, e.target.value);
  };

  return <div style={{ height: '30em', overflow: 'auto' }}>{renderQR()}</div>;
};

export default QpaySection;
