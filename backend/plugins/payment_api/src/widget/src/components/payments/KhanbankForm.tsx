import { usePayment } from "../../hooks/use-payment";
import { Input } from "../ui/input";


const LabelInputRow = ({
  label,
  value,
  onCopy,
  apiDomain,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  apiDomain: string;
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
          src={`${apiDomain}/pl:payment/static/images/copy.svg`}
          alt='Copy Icon'
          className='w-5 h-5'
        />
      </button>
    </div>
  </div>
);

const KhanbankForm = () => {
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

      <LabelInputRow
        label='Дансны дугаар'
        value={apiResponse.accountNumber}
        onCopy={() => copyToClipboard(apiResponse.accountNumber)}
        apiDomain={apiDomain}
      />

      <LabelInputRow
        label='IBAN'
        value={apiResponse.ibanAcctNo}
        onCopy={() => copyToClipboard(apiResponse.ibanAcctNo)}
        apiDomain={apiDomain}
      />

      <LabelInputRow
        label='Дансны эзэмшигч'
        value={apiResponse.accountName?.trim()}
        onCopy={() => copyToClipboard(apiResponse.accountName)}
        apiDomain={apiDomain}
      />

      <LabelInputRow
        label='Гүйлгээний дүн'
        value={transaction.amount.toString()}
        onCopy={() => copyToClipboard(transaction.amount.toString())}
        apiDomain={apiDomain}
      />

      <LabelInputRow
        label='Гүйлгээний утга'
        value={invoiceDetail.description}
        onCopy={() => copyToClipboard(apiResponse.description)}
        apiDomain={apiDomain}
      />
    </div>
  );
};

export default KhanbankForm;
