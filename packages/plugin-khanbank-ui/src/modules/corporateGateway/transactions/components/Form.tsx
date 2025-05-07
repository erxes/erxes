import React, { useEffect, useState } from 'react';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { __ } from '@erxes/ui/src/utils/core';
import { BANK_CODES } from '../../../../constants';
import { IAccountHolder, IKhanbankAccount } from '../../accounts/types';
import { IKhanbankTransactionInput } from '../types';
import Spinner from '@erxes/ui/src/components/Spinner';
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
  const [transactionType, setTransactionType] = useState<number>(1);
  const defaultCurrency =
    accounts.find((a) => a.number === accountNumber)?.currency || 'MNT';
  const [transaction, setTransaction] = useState<IKhanbankTransactionInput>({
    fromAccount: `${accountNumber || accounts[0]?.number || ''}`,
    toAccount: '',
    toAccountName: '',
    amount: 0,
    currency:
      accounts.find((a) => a.number === accountNumber)?.currency || 'MNT',
    transferid: new Date().getTime().toString(),
    toBank: '050000',
    toCurrency: 'MNT',
    description: '',
    password: '',
    loginName: '',
    type: 'domestic',
  });

  // Update state only if necessary
  useEffect(() => {
    if (accountNumber) {
      setTransaction((prev) => ({
        ...prev,
        fromAccount: accountNumber,
        currency: defaultCurrency,
      }));
    }
  }, [accountNumber, accounts, defaultCurrency]);

  useEffect(() => {
    if (accountHolder?.number) {
      setTransaction((prev) => ({
        ...prev,
        toAccount: accountHolder.number,
        toAccountName: `${accountHolder.custFirstName || ''}`.trim(),
        toCurrency: accountHolder.currency || 'MNT',
      }));
    }
  }, [accountHolder]);

  const handleInputChange = (e: any) => {
    const { id, value } = e.target;
    const changes: any = {
      [id]: value,
    };
    if (id === 'toBank') {
      changes.toAccount = '';
      changes.toAccountName = '';
    }

    setTransaction((prev) => ({ ...prev, ...changes }));
  };

  const handleTransactionTypeChange = (e: any) => {
    const newType = Number(e.currentTarget.value);

    setTransactionType(newType);

    setTransaction((prev) => ({
      ...prev,
      type: newType === 3 ? 'interbank' : 'domestic',
      toBank: newType === 3 ? '' : '050000',
      toAccount: '',
      toAccountName: '',
    }));
  };

  const handleBlur = (e: any) => {
    if ([1, 3].includes(transactionType)) {
      getAccountHolder(e.target.value, transaction.toBank);
    }
  };

  const renderContent = () => {
    return (
      <>
        <FormGroup>
          <ControlLabel>Нэвтрэх нэр</ControlLabel>
          <p>{__('Интернэт банкны нэвтрэх нэр')}</p>
          <FormControl
            id='loginName'
            name='loginName'
            type='text'
            required
            value={transaction.loginName}
            onChange={handleInputChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Нууц үг</ControlLabel>
          <p>{__('Интернэт банкны нууц үг')}</p>
          <FormControl
            id='password'
            name='password'
            type='password'
            required
            value={transaction.password}
            onChange={handleInputChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Гүйлгээний төрөл</ControlLabel>
          <FormControl
            id='transactionType'
            name='transactionType'
            componentclass='select'
            required
            value={transactionType}
            onChange={handleTransactionTypeChange}
          >
            <option value={1}>Банк доторхи</option>
            <option value={2}>Өөрийн данс хооронд</option>
            <option value={3}>Банк хооронд</option>
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Шилжүүлэх данс</ControlLabel>
          <FormControl
            id='fromAccount'
            name='fromAccount'
            required
            value={getRawAccountNumber(transaction.fromAccount)}
            disabled
          />
        </FormGroup>
        {transactionType === 3 && (
          <FormGroup>
            <ControlLabel>Банк</ControlLabel>
            <FormControl
              id='toBank'
              name='toBank'
              componentclass='select'
              required
              value={transaction.toBank}
              onChange={handleInputChange}
            >
              <option value=''>Банк сонгоно уу</option>
              {BANK_CODES.map((bank) => (
                <option key={bank.value} value={bank.value}>
                  {bank.label}
                </option>
              ))}
            </FormControl>
          </FormGroup>
        )}
        {transactionType !== 2 && (
          <>
            <FormGroup>
              <ControlLabel>Хүлээн авах данс/IBAN дугаар</ControlLabel>
              <FormControl
                id='toAccount'
                name='toAccount'
                required
                min={999999999}
                max={9999999999}
                value={transaction.toAccount}
                onChange={handleInputChange}
                onBlur={handleBlur}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Хүлээн авагчийн нэр</ControlLabel>
              {accountLoading ? (
                <Spinner objective={true} />
              ) : (
                <FormControl
                  id='toAccountName'
                  name='toAccountName'
                  type='text'
                  required
                  value={transaction.toAccountName}
                  onChange={handleInputChange}
                  disabled={transactionType === 3}
                />
              )}
            </FormGroup>
          </>
        )}

        {transactionType === 2 && (
          <FormGroup>
            <ControlLabel>Хүлээн авах данс/IBAN дугаар</ControlLabel>
            <FormControl
              id='toAccount'
              name='toAccount'
              componentclass='select'
              required
              value={transaction.toAccount}
              onChange={handleInputChange}
            >
              <option value=''>Данс сонгох</option>
              {accounts
                .filter((a) => a.number !== transaction.fromAccount)
                .map((account) => (
                  <option key={account.number} value={account.number}>
                    {account.number} - {account.currency}
                  </option>
                ))}
            </FormControl>
          </FormGroup>
        )}
        <Button
          type='submit'
          btnStyle='success'
          onClick={() => {
            submit(transaction);
          }}
        >
          Submit
        </Button>
        <Button type='button' onClick={closeModal}>
          Cancel
        </Button>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default TransactionForm;
