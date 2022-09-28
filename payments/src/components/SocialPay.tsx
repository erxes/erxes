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

  const renderInvoiceData = () => {
    if (!invoice || !invoice.qrText || invoiceByPhone) {
      return null;
    }

    return (
      <div className='border'>
        <img src={invoice.qrTexts} alt='' width='150px' className='center' id='qpay' />

        <div>
          <label className='labelSpecial centerStatus'>
            Status: {invoice.status}
          </label>
        </div>
      </div>
    );
  };

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

  return (
    <div style={{ height: '30em', overflow: 'auto' }}>
      {renderInvoiceData()}
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
    </div>
  );
};

export default SocialPaySection;
