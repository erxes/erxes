import { usePayment } from '../../hooks/use-payment';
import { Input } from '../ui/input';

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
  <div className="mb-4 w-full">
    <label className="text-sm mb-1 block">{label}</label>

    <div className="flex items-center gap-2 w-full">
      <Input className="w-full border rounded-lg grow" value={value} readOnly />

      <button
        type="button"
        onClick={onCopy}
        className="ml-2 w-10 h-10 shrink-0 flex items-center justify-center bg-blue-500 hover:bg-blue-600 rounded-lg"
      >
        <img
          src={`${apiDomain}/pl:payment/static/images/copy.svg`}
          alt="Copy Icon"
          className="w-5 h-5"
        />
      </button>
    </div>
  </div>
);

const TdbCGWForm = () => {
  const { transaction, apiResponse, invoiceDetail, apiDomain } = usePayment();

  if (!transaction) {
    return null;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => alert('Copied to clipboard!'))
      .catch(() => alert('Failed to copy!'));
  };

  const accountNumber = apiResponse?.accountNumber || '';
  const iban = apiResponse?.iban || '';
  const accountName = apiResponse?.accountName?.trim() || '';
  const amount = transaction.amount.toString();
  const description = invoiceDetail?.description || '';

  return (
    <div className="p-4">
      <LabelInputRow
        label="Дансны дугаар"
        value={accountNumber}
        onCopy={() => copyToClipboard(accountNumber)}
        apiDomain={apiDomain}
      />

      <LabelInputRow
        label="IBAN"
        value={iban}
        onCopy={() => copyToClipboard(iban)}
        apiDomain={apiDomain}
      />

      <LabelInputRow
        label="Дансны эзэмшигч"
        value={accountName}
        onCopy={() => copyToClipboard(accountName)}
        apiDomain={apiDomain}
      />

      <LabelInputRow
        label="Гүйлгээний дүн"
        value={amount}
        onCopy={() => copyToClipboard(amount)}
        apiDomain={apiDomain}
      />

      <LabelInputRow
        label="Гүйлгээний утга"
        value={description}
        onCopy={() => copyToClipboard(description)}
        apiDomain={apiDomain}
      />
    </div>
  );
};

export default TdbCGWForm;
