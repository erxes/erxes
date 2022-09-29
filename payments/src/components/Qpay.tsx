import { useState } from 'react';
import {QRCodeSVG} from 'qrcode.react';
import { IPaymentParams } from '../types';

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
  onChange: (key: string, value: any) => void;
};

const QpaySection = (props: Props) => {
  const { params, invoice } = props;

  const renderQR = () => {
    if (!props.invoice) {
      return null;
    }

    return (
      <>
        <div className='border'>
           {invoice.qrText && (
            <div>
             <QRCodeSVG value={invoice.qrText} />
            </div>
          )}
          <div>
            <label className='labelSpecial centerStatus' htmlFor='qpay'>
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

  return (
    <div style={{ height: '30em', overflow: 'auto' }}>
      {renderQR()}

      {invoice && invoice.qrText ? null : (
        <div className='border'>
          <div>
            <label className='label' htmlFor='amount'>
              Amount:{' '}
            </label>
            <input
              type='text'
              value={params.amount}
              onChange={(e) => onChange(e)}
              name='amount'
              id='amount'
              disabled={true}
            />
            <label className='label' htmlFor='description'>
              Description:{' '}
            </label>
            <input
              type='text'
              value={params.description}
              onChange={(e) => onChange(e)}
              name='description'
              id='description'
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QpaySection;
