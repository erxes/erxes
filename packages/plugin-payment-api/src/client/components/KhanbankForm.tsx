import React from 'react';
import { usePayment } from './Payments';
import ModalHeader from './ModalHeader';
import CloseButton from './CloseButton';
import { Input } from '../common/input';
import CheckPayment from './checkPayment';

type Props = {};

const KhanbankForm = (props: Props) => {
  const { transaction, apiResponse, invoiceDetail, apiDomain } = usePayment();

  if (!transaction) {
    return null;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert('Copied to clipboard!');
      })
      .catch(() => {
        alert('Failed to copy!');
      });
  };

  return (
    <div className='aspect-square'>
      <ModalHeader />

      <label htmlFor='accountNumber' className='text-sm inline-block'>
        Дансны дугаар
      </label>
      <div className='flex items-center mb-4'>
        <Input
          className='flex-grow border rounded-l-lg'
          value={apiResponse.accountNumber}
          readOnly
        />
        <button
          onClick={() => copyToClipboard(apiResponse.accountNumber)}
          className='relative px-3 py-1 bg-blue-500 rounded-r-lg hover:bg-blue-600'
          style={{ zIndex: 10 }}
        >
          <img
            src={`${apiDomain}/pl:payment/static/images/copy.svg`}
            alt='Copy Icon'
            className='w-5 h-5'
            style={{ width: '24px', height: '24px' }}
          />
        </button>
      </div>
      <br />
      <label htmlFor='accountName' className='text-sm inline-block mt-2'>
        Дансны эзэмшигч
      </label>
      <div className='flex items-center mb-4'>
        <Input
          className='flex-grow border rounded-l-lg'
          value={apiResponse.accountName?.trim()}
          readOnly
        />
        <button
          onClick={() => copyToClipboard(apiResponse.accountName)}
          className='relative px-3 py-1 bg-blue-500 rounded-r-lg hover:bg-blue-600'
          style={{ zIndex: 10 }}
        >
          <img
            src={`${apiDomain}/pl:payment/static/images/copy.svg`}
            alt='Copy Icon'
            className='w-5 h-5'
            style={{ width: '24px', height: '24px' }}
          />
        </button>
      </div>
      <br />
      <label htmlFor='amount' className='text-sm inline-block'>
        Гүйлгээний дүн
      </label>
      <div className='flex items-center mb-4'>
        <Input
          className='flex-grow border rounded-l-lg'
          value={transaction.amount}
          readOnly
        />

        <button
          onClick={() => copyToClipboard(transaction.amount.toString())}
          className='relative px-3 py-1 bg-blue-500 rounded-r-lg hover:bg-blue-600'
          style={{ zIndex: 10 }}
        >
          <img
            src={`${apiDomain}/pl:payment/static/images/copy.svg`}
            alt='Copy Icon'
            className='w-5 h-5'
            style={{ width: '24px', height: '24px' }}
          />
        </button>
      </div>
      <br />
      <label htmlFor='description' className='text-sm inline-block'>
        Гүйлгээний утга
      </label>
      <div className='flex items-center mb-4'>
        <Input
          className='flex-grow border rounded-l-lg'
          value={invoiceDetail.description}
          readOnly
        />

        <button
          onClick={() => copyToClipboard(apiResponse.description)}
          className='relative px-3 py-1 bg-blue-500 rounded-r-lg hover:bg-blue-600'
          style={{ zIndex: 10 }}
        >
          <img
            src={`${apiDomain}/pl:payment/static/images/copy.svg`}
            alt='Copy Icon'
            className='w-5 h-5'
            style={{ width: '24px', height: '24px' }}
          />
        </button>
      </div>

      <div className='sticky -bottom-4 bg-white -mx-4 px-4 pb-4 mt-4 -mb-4'>
        <CheckPayment />
        <CloseButton />
      </div>
    </div>
  );
};

export default KhanbankForm;
