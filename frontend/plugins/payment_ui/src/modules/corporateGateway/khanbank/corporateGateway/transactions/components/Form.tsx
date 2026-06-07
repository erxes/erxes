import { useEffect, useState } from 'react';
import { Button, Input, Label, Select } from 'erxes-ui';
import { BANK_CODES } from '../../../../constants';
import { IAccountHolder, IKhanbankAccount } from '../../accounts/types';
import { IKhanbankTransactionInput } from '../types';
import { getRawAccountNumber } from '../../../../utils';

type Props = {
  configId: string;
  accounts: IKhanbankAccount[];
  accountNumber?: string;
  accountHolder: IAccountHolder;
  getAccountHolder: (accountNumber: string, bankCode?: string) => void;
  accountLoading?: boolean;
  submit: (transfer: IKhanbankTransactionInput) => void;
  closeModal: () => void;
};

const TransactionForm = ({
  accounts = [],
  accountNumber,
  accountHolder,
  getAccountHolder,
  accountLoading,
  submit,
  closeModal,
}: Props) => {
  const defaultCurrency =
    accounts.find((a) => a.number === accountNumber)?.currency || 'MNT';

  const [transactionType, setTransactionType] = useState<number>(1);

  const [transaction, setTransaction] = useState<IKhanbankTransactionInput>({
    fromAccount: accountNumber || accounts[0]?.number || '',
    toAccount: '',
    toAccountName: '',
    amount: 0,
    currency: defaultCurrency,
    transferid: Date.now().toString(),
    toBank: '050000',
    toCurrency: 'MNT',
    description: '',
    password: '',
    loginName: '',
    type: 'domestic',
  });

  useEffect(() => {
    if (accountNumber) {
      setTransaction((prev) => ({
        ...prev,
        fromAccount: accountNumber,
        currency: defaultCurrency,
      }));
    }
  }, [accountNumber]);

  useEffect(() => {
    if (accountHolder?.number) {
      setTransaction((prev) => ({
        ...prev,
        toAccount: accountHolder.number,
        toAccountName: accountHolder.custFirstName || '',
        toCurrency: accountHolder.currency || 'MNT',
      }));
    }
  }, [accountHolder]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setTransaction((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = Number(e.target.value);

    setTransactionType(newType);

    setTransaction((prev) => ({
      ...prev,
      type: newType === 3 ? 'interbank' : 'domestic',
      toBank: newType === 3 ? '' : '050000',
      toAccount: '',
      toAccountName: '',
    }));
  };

  const handleBlur = () => {
    if ([1, 3].includes(transactionType)) {
      getAccountHolder(transaction.toAccount, transaction.toBank);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(transaction);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Login */}
      <div>
        <Label>Нэвтрэх нэр</Label>
        <Input
          name="loginName"
          value={transaction.loginName}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label>Нууц үг</Label>
        <Input
          type="password"
          name="password"
          value={transaction.password}
          onChange={handleChange}
          required
        />
      </div>

      {/* Type */}
      <div>
        <Label>Гүйлгээний төрөл</Label>
        <Select
          name="transactionType"
          value={transactionType}
          onChange={handleTypeChange}
        >
          <option value={1}>Банк доторхи</option>
          <option value={2}>Өөрийн данс хооронд</option>
          <option value={3}>Банк хооронд</option>
        </Select>
      </div>

      {/* From Account */}
      <div>
        <Label>Шилжүүлэх данс</Label>
        <Input value={getRawAccountNumber(transaction.fromAccount)} disabled />
      </div>

      {/* Bank Select */}
      {transactionType === 3 && (
        <div>
          <Label>Банк</Label>
          <Select
            name="toBank"
            value={transaction.toBank}
            onChange={handleChange}
            required
          >
            <option value="">Банк сонгоно уу</option>
            {BANK_CODES.map((bank) => (
              <option key={bank.value} value={bank.value}>
                {bank.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* To Account */}
      {transactionType !== 2 && (
        <>
          <div>
            <Label>Хүлээн авах данс/IBAN</Label>
            <Input
              name="toAccount"
              value={transaction.toAccount}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
          </div>

          <div>
            <Label>Хүлээн авагчийн нэр</Label>
            <Input
              name="toAccountName"
              value={accountLoading ? 'Loading...' : transaction.toAccountName}
              onChange={handleChange}
              disabled={transactionType === 3}
              required
            />
          </div>
        </>
      )}

      {/* Own account transfer */}
      {transactionType === 2 && (
        <div>
          <Label>Хүлээн авах данс</Label>
          <Select
            name="toAccount"
            value={transaction.toAccount}
            onChange={handleChange}
            required
          >
            <option value="">Данс сонгох</option>
            {accounts
              .filter((a) => a.number !== transaction.fromAccount)
              .map((a) => (
                <option key={a.number} value={a.number}>
                  {a.number} - {a.currency}
                </option>
              ))}
          </Select>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={closeModal}>
          Cancel
        </Button>

        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
};

export default TransactionForm;
