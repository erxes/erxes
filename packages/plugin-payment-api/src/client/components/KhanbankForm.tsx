import React from 'react';
import { usePayment } from './Payments';
import ModalHeader from './ModalHeader';
import CloseButton from './CloseButton';
import { Input } from '../common/input';
import CheckPayment from './checkPayment';

type Props = {};

const LabelInputRow = ({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) => (
  <div className='mb-4 w-full'>
    <label className='text-sm mb-1 block'>{label}</label>
    <div className='flex items-center gap-2 w-full'>
      <Input
        className='w-full border rounded-lg flex-grow'
        value={value}
        readOnly
      />
      <button
        onClick={onCopy}
        className='ml-2 w-10 h-10 flex-shrink-0 flex items-center justify-center bg-blue-500 hover:bg-blue-600 rounded-lg'
      >
        <img
          src='/pl:payment/static/images/copy.svg'
          alt='Copy Icon'
          className='w-5 h-5'
        />
      </button>
    </div>
  </div>
);


const KhanbankForm = (props: Props) => {
  const { transaction, apiResponse, invoiceDetail, apiDomain } = usePayment();

  if (!transaction) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => alert('Copied to clipboard!'))
      .catch(() => alert('Failed to copy!'));
  };

  return (
    <div className='p-4'>
      <ModalHeader />

      <LabelInputRow
        label='Дансны дугаар'
        value={apiResponse.accountNumber}
        onCopy={() => copyToClipboard(apiResponse.accountNumber)}
      />

      <LabelInputRow
        label='IBAN'
        value={apiResponse.ibanAcctNo}
        onCopy={() => copyToClipboard(apiResponse.ibanAcctNo)}
      />

      <LabelInputRow
        label='Дансны эзэмшигч'
        value={apiResponse.accountName?.trim()}
        onCopy={() => copyToClipboard(apiResponse.accountName)}
      />

      <LabelInputRow
        label='Гүйлгээний дүн'
        value={transaction.amount.toString()}
        onCopy={() => copyToClipboard(transaction.amount.toString())}
      />

      <LabelInputRow
        label='Гүйлгээний утга'
        value={invoiceDetail.description}
        onCopy={() => copyToClipboard(apiResponse.description)}
      />

      <div className='sticky bottom-0 bg-white -mx-4 px-4 pb-4 mt-4'>
        <CheckPayment />
        <CloseButton />
      </div>
    </div>
  );
};

export default KhanbankForm;
