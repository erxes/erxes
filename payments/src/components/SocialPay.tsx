import { useState } from 'react';

import { IPaymentParams } from '../types';

type Props = {
  params: IPaymentParams;
  invoice?: any;
};

const SocialPaySection = (props: Props) => {
  const { params, invoice } = props;

  const [amount, setAmount] = useState(params.amount || '0');
  const [qr, setQr] = useState(invoice && invoice.qrText || '');
  const [description, setDescription] = useState(params.description || '');
  const [phone, setPhone] = useState(params.phone || '');
  const [invoiceByPhone, setInvoiceByPhone] = useState<boolean>(
    params.phone ? true : false
  );

  const renderInvoiceData = () => {
    if (!qr || invoiceByPhone) {
      return null;
    }

    return (
      <div className='border'>
        <img src={qr} alt='' width='150px' className='center' id='qpay' />

        <div>
          <label className='labelSpecial centerStatus'>
            Status: {invoice.status}
          </label>
        </div>
      </div>
    );
  };

  const onChange = (e: any) => {
    if (e.target._id === 'amount') {
      return setAmount(e.target.value);
    }

    if (e.target._id === 'phone') {
      return setPhone(e.target.value);
    }

    setDescription(e.target.value);
  };

  return (
    <div style={{ height: '30em', overflow: 'auto' }}>
      {renderInvoiceData()}
      <div className='border'>
        <div style={{ marginBottom: '5px' }}>
          <label className='label' htmlFor='withPhone'>
            Create invoice with phone number:
          </label>
          <input
            type='checkbox'
            onClick={(e: any) => setInvoiceByPhone(e.target.checked)}
            id='withPhone'
            name='withPhone'
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
          value={amount}
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
          value={description}
          onChange={onChange}
          name='description'
          id='description'
        />
      </div>
    </div>
  );
};

export default SocialPaySection;
