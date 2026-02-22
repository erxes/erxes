import { useState } from 'react';
import { Button, Input, Label, Select } from 'erxes-ui';
import { IGolomtBankTransactionInput } from '../../../types/ITransactions';
import { IGolomtBankAccount } from '../../../types/IGolomtAccount';

type Props = {
  configId: string;
  accounts?: IGolomtBankAccount[];
  accountNumber?: string;
  accountName: string;
  onSubmit: (transfer: IGolomtBankTransactionInput) => void;
  closeModal: () => void;
  loading?: boolean;
};

const TRANSACTION_TYPES = [
  { value: 'TSF', label: 'Transfer' },
  { value: 'INT', label: 'Internal' },
];

const BANK_CODES = [
  { value: '15', label: 'Golomt Bank' },
  // add more if needed
];

const TransactionForm = ({
  accountNumber,
  accountName,
  onSubmit,
  closeModal,
  loading = false,
}: Props) => {
  const [refCode, setRefCode] = useState('');
  const [fromAccount, setFromAccount] = useState(accountNumber ?? '');
  const [fromAccountName, setFromAccountName] = useState(accountName ?? '');
  const [fromCurrency, setFromCurrency] = useState('MNT');

  const [toBank, setToBank] = useState('15');
  const [toAccount, setToAccount] = useState('');
  const [toAccountName, setToAccountName] = useState('');
  const [toCurrency, setToCurrency] = useState('MNT');

  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [type, setType] = useState('TSF');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      refCode,
      fromAccount,
      fromAccountName,
      fromCurrency,
      toBank,
      toAccount,
      toAccountName,
      toCurrency,
      amount,
      description,
      type,
    });
  };

  const renderInput = (
    label: string,
    value: string | number,
    onChange: (v: any) => void,
    type: string = 'text',
  ) => (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderInput('Ref number', refCode, setRefCode)}

      <div className="space-y-1">
        <Label>Type</Label>
        <Select value={type} onValueChange={setType}>
          <Select.Trigger />
          <Select.Content>
            {TRANSACTION_TYPES.map((t) => (
              <Select.Item key={t.value} value={t.value}>
                {t.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      {renderInput('From account number', fromAccount, setFromAccount)}
      {renderInput('From account name', fromAccountName, setFromAccountName)}
      {renderInput('From currency', fromCurrency, setFromCurrency)}

      <div className="space-y-1">
        <Label>To bank</Label>
        <Select value={toBank} onValueChange={setToBank}>
          <Select.Trigger />
          <Select.Content>
            {BANK_CODES.map((b) => (
              <Select.Item key={b.value} value={b.value}>
                {b.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      {renderInput('To account number', toAccount, setToAccount)}
      {renderInput('To account name', toAccountName, setToAccountName)}
      {renderInput('To currency', toCurrency, setToCurrency)}
      {renderInput('Amount', amount, (v) => setAmount(Number(v)), 'number')}
      {renderInput('Description', description, setDescription)}

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={closeModal}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit'}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
