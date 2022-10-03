import { QRCodeSVG } from 'qrcode.react';
// import { useState } from "react";
import * as React from 'react';
import { IInvoice, IPaymentParams, ISocialPayResponse } from '../types';

type Props = {
  params: IPaymentParams;
  invoice?: IInvoice;
  onChange: (key: string, value: any) => void;
};

const SocialPaySection = (props: Props) => {
  const { invoice } = props;

  const response = invoice && (invoice.apiResponse as ISocialPayResponse);

  const renderInvoiceData = () => {
    if (!response || !response.text) {
      return null;
    }

    if (!response.text.includes('socialpay-payment')) {
      return (
        <div>
          <label className="label" htmlFor="response">
            {response.text}
          </label>
        </div>
      );
    }

    return (
      <>
        <div className="border">
          <div>
            <QRCodeSVG value={response.text} />
          </div>

          <div>
            <label className="labelSpecial centerStatus">
              Status: {invoice.status}
            </label>
          </div>
        </div>
      </>
    );
  };

  return (
    <div style={{ height: '30em', overflow: 'auto' }}>
      {renderInvoiceData()}
    </div>
  );
};

export default SocialPaySection;
