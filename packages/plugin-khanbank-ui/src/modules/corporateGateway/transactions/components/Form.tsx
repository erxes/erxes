import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React, { useState } from 'react';

import { BANK_CODES, TRANSACTION_TYPES } from '../../../../constants';
import { IAccountHolder, IKhanbankAccount } from '../../accounts/types';
import { IKhanbankTransactionInput } from '../types';

type Props = {
  configId: string;
  accounts: IKhanbankAccount[];
  accountNumber?: string;
  accountHolder: IAccountHolder;
  getAccountHolder: (accountNumber: string, bankCode?: string) => void;
  submit: (transfer: IKhanbankTransactionInput) => void;
  closeModal: () => void;
};

const TransactionForm = (props: Props) => {
  const accounts = props.accounts || [];

  const [transactionType, setTransactionType] = useState(1);

  const [transaction, setTransaction] = useState<IKhanbankTransactionInput>({
    fromAccount:
      props.accountNumber || (accounts.length && accounts[0].number) || '',
    toAccount: props.accountHolder.number || '',
    toAccountName:
      `${props.accountHolder.custFirstName} ${props.accountHolder.custLastName}` ||
      '',
    amount: 0,
    currency:
      accounts.find(a => a.number === props.accountNumber)?.currency || 'MNT',
    transferid: '',
    toBank: '050000',
    toCurrency: props.accountHolder.currency || 'MNT',
    description: '',
    password: '',
    loginName: '',
    type: 'domestic'
  });

  React.useEffect(() => {
    if (props.accountNumber) {
      setTransaction({
        ...transaction,
        fromAccount: props.accountNumber,
        currency:
          accounts.find(a => a.number === props.accountNumber)?.currency ||
          'MNT'
      });
    }

    if (props.accountHolder) {
      const toAccountName = `${props.accountHolder.custFirstName || ''} ${props
        .accountHolder.custLastName || ''}`;

      setTransaction({
        ...transaction,
        toAccount: props.accountHolder.number || transaction.toAccount || '',
        toAccountName: !toAccountName.length
          ? transaction.toAccountName
          : toAccountName,
        toCurrency: props.accountHolder.currency || 'MNT'
      });
    }
  }, [props.accountHolder, props.accountNumber]);

  const onChangeType = e => {
    const { value } = e.currentTarget;

    if (value === 3) {
      setTransaction({
        ...transaction,
        type: 'interbank',
        toAccount: '',
        toAccountName: '',
        toBank: ''
      });
    } else {
      setTransaction({
        ...transaction,
        type: 'domestic',
        toBank: '050000',
        toAccount: '',
        toAccountName: ''
      });

      setTransactionType(Number(value));
    }

    setTransaction({ ...transaction, toAccount: '', toAccountName: '' });
  };

  const onChangeInput = e => {
    const { id, value } = e.target;

    setTransaction({ ...transaction, [id]: value });
  };

  const renderInput = (formProps, title, name, type, value, description?) => {
    return (
      <FormGroup>
        <ControlLabel required={formProps.required}>{title}</ControlLabel>
        <p>{__(description)}</p>
        <FormControl
          {...formProps}
          id={name}
          name={name}
          type={type}
          required={true}
          defaultValue={value}
          onChange={onChangeInput}
          errors={formProps.errors}
        />
      </FormGroup>
    );
  };

  const renderAccountInput = formProps => {
    if (transactionType === 2) {
      return null;
    }

    const onBlur = () => {
      if (transactionType === 3) {
        return;
      }

      props.getAccountHolder(transaction.toAccount, transaction.toBank);
    };

    const accountHolderProps: any = {
      ...formProps,
      min: 999999999,
      max: 9999999999,
      required: true,
      onBlur
    };

    return (
      <>
        {renderInput(
          accountHolderProps,
          'Recipient account',
          'toAccount',
          'number',
          transaction.toAccount
        )}
        {renderInput(
          {
            ...formProps,
            required: true,
            disabled: transactionType !== 3,
            value: transaction.toAccountName,
            onFocus: () => {
              if (transaction.toAccountName === ' ') {
                setTransaction({ ...transaction, toAccountName: '' });
              }
            }
          },
          'Recipient name',
          'toAccountName',
          'string',
          transaction.toAccountName,
          transactionType === 3
            ? "check the recipient's name before making a transfer"
            : ''
        )}
      </>
    );
  };

  const renderBankSelect = formProps => {
    if (transactionType !== 3) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel required={formProps.required}>Bank</ControlLabel>
        <FormControl
          {...formProps}
          id="toBank"
          name="toBank"
          componentClass="select"
          required={true}
          defaultValue={transaction.toBank}
          onChange={onChangeInput}
          errors={formProps.errors}
        >
          <option value="">Select bank</option>
          {BANK_CODES.map(bank => (
            <option key={bank.value} value={bank.value}>
              {bank.label}
            </option>
          ))}
        </FormControl>
      </FormGroup>
    );
  };

  const renderAccountSelect = formProps => {
    if (transactionType !== 2) {
      return null;
    }

    const options = accounts.filter(a => a.number !== transaction.fromAccount);

    return (
      <FormGroup>
        <ControlLabel required={formProps.required}>
          Recipient account
        </ControlLabel>
        <FormControl
          {...formProps}
          id="toAccount"
          name="toAccount"
          componentClass="select"
          required={true}
          defaultValue={transaction.toAccount}
          onChange={onChangeInput}
          errors={formProps.errors}
        >
          <option value="">Select account</option>
          {options.map(account => (
            <option key={account.number} value={account.number}>
              {account.number} - {account.currency}
            </option>
          ))}
        </FormControl>
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal } = props;
    const { isSubmitted } = formProps;

    const content = p => {
      return (
        <>
          <FormGroup>
            <ControlLabel>{__('Login name')}</ControlLabel>
            <p>{__('internet bank login name')}</p>
            <FormControl
              {...p}
              id="loginName"
              name="loginName"
              type="text"
              required={true}
              defaultValue={transaction.loginName}
              onChange={onChangeInput}
              errors={p.errors}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>{__('Password')}</ControlLabel>
            <p>{__('internet bank password')}</p>
            <FormControl
              {...p}
              id="password"
              name="password"
              type="password"
              required={true}
              defaultValue={transaction.password}
              onChange={onChangeInput}
              errors={p.errors}
            />
          </FormGroup>

          <ModalFooter>
            <Button
              btnStyle="success"
              icon="check-circle"
              type="submit"
              onClick={() => {
                props.submit({
                  ...transaction,
                  amount: Number(transaction.amount)
                });
              }}
            >
              Submit{' '}
            </Button>
          </ModalFooter>
        </>
      );
    };

    const authModal = () => {
      return (
        <ModalTrigger
          title={'Confirmation'}
          size={'sm'}
          enforceFocus={false}
          trigger={
            <Button btnStyle="success" icon="">
              Transfer{' '}
            </Button>
          }
          autoOpenKey="showListFormModal"
          content={content}
          dialogClassName="transform"
        />
      );
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Transaction type')}</ControlLabel>
          <FormControl
            id="type"
            componentClass="select"
            value={transactionType}
            onChange={onChangeType}
          >
            {TRANSACTION_TYPES.map(e => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>{__('Account')}</ControlLabel>
          <FormControl
            id="fromAccount"
            componentClass="select"
            value={transaction.fromAccount}
            onChange={onChangeInput}
          >
            {accounts.map(e => (
              <option key={e.number} value={e.number}>
                {e.number} - {e.name} - {e.balance.toLocaleString()}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        {renderBankSelect(formProps)}
        {renderAccountInput(formProps)}
        {renderAccountSelect(formProps)}

        {renderInput(
          { ...formProps, min: 0, required: true },
          'Transaction amount',
          'amount',
          'number',
          transaction.amount.toLocaleString()
        )}
        {renderInput(
          { ...formProps, required: true },
          'Description',
          'description',
          'string',
          transaction.description
        )}

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Cancel{' '}
          </Button>

          {authModal()}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default TransactionForm;
