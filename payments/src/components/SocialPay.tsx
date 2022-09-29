import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

import { IPaymentParams } from '../types';

type Props = {
  params: IPaymentParams;
  invoice?: any;
  onChange: (key: string, value: any) => void;
};

const SocialPaySection = (props: Props) => {
  const { params, invoice } = props;

  const [phone, setPhone] = useState(params.phone || '');
  const [invoiceByPhone, setInvoiceByPhone] = useState<boolean>(
    params.phone ? true : false
  );

  const onChange = (e: any) => {
    if (e.target.id === 'phone') {
      setPhone(e.target.value);
    }

    if (e.target.id !== 'invoiceByPhone') {
      return props.onChange(e.target.id, e.target.value);
    }

    setInvoiceByPhone(e.target.checked);

    if (!e.target.checked) {
      setPhone('');
      props.onChange('phone', '');
    }
  };

  const renderInvoiceData = () => {
    if (!invoice || !invoice.qrText) {
      return null;
    }

    return (
      <>
        <div className='border'>
          {invoice.qrText.includes('socialpay-payment') ? (
            <div>
              <QRCodeSVG value={invoice.qrText} />
            </div>
          ): 
          <div>
            Invoice has been created. Please check your phone.
          </div>
          }

          <div>
            <label className='labelSpecial centerStatus'>
              Status: {invoice.status}
            </label>
          </div>
        </div>
      </>
    );
  };

  const renderInputs = () => {
    if (invoice){
      return null;
    }

    return (
      <div className='border'>
      <div style={{ marginBottom: '5px' }}>
        <label className='label' htmlFor='invoiceByPhone'>
          Create invoice with phone number:
        </label>
        <input
          type='checkbox'
          onClick={onChange}
          id='invoiceByPhone'
          name='invoiceByPhone'
          checked={invoiceByPhone}
        />
      </div>
      {invoiceByPhone && (
        <>
          <label className='label'>phone:</label>
          <input type='text' value={phone} onChange={onChange} id='phone' />
        </>
      )}
      <label className='label' htmlFor='amount'>
        Amount:{' '}
      </label>
      <input
        type='text'
        value={params.amount}
        onChange={onChange}
        disabled={true}
        name='amount'
        id='amount'
      />

      <label className='label' htmlFor='description'>
        Description:{' '}
      </label>
      <input
        type='text'
        value={params.description}
        onChange={onChange}
        name='description'
        id='description'
      />
    </div>
    )
  }

  return (
    <div style={{ height: '30em', overflow: 'auto' }}>
      {renderInvoiceData()}
      {renderInputs()}
    </div>
  );
};

export default SocialPaySection;
