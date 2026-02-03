import React from 'react';
import { Button } from 'erxes-ui';
import { useQueryState } from 'erxes-ui/hooks/use-query-state';

import Transactions from './Transactions';
import TransactionForm from '../../transactions/components/Form';

import {
  IGolomtBankAccountDetail,
  IGolomtBankAccountBalance,
} from '../../../types';

type Props = {
  account: IGolomtBankAccountDetail;
  balances?: IGolomtBankAccountBalance;
};

const Detail = ({ account, balances }: Props) => {
  const [configId] = useQueryState<string>('_id');
  const [accountNumber] = useQueryState<string>('account');
  const [showTransfer, setShowTransfer] =
    React.useState(false);

  const getStatusValue = (value: string) => {
    switch (value) {
      case 'A':
        return 'active';
      case 'I':
        return 'inactive';
      case 'D':
        return 'dormant';
      default:
        return '';
    }
  };

  const isRel = (value: string) => {
    switch (value) {
      case 'N':
        return 'NO';
      case 'Y':
        return 'YES';
      default:
        return '';
    }
  };

  const renderAccount = () => (
    <div>
      <h4>Account detail</h4>

      <BlockRow>
        <FormGroup>
          <p>Account</p>
          <strong>{account.accountNumber}</strong>
        </FormGroup>

        <FormGroup>
          <p>Account name</p>
          <strong>{account.accountName}</strong>
        </FormGroup>

        <FormGroup>
          <p>Customer name</p>
          <strong>{account.customerName}</strong>
        </FormGroup>
      </BlockRow>

      <BlockRow>
        <FormGroup>
          <p>Balance</p>
          {(balances?.balanceLL || []).map((balance) => (
            <strong key={balance.amount.toString()}>
              {balance.amount.value.toLocaleString()}
              {getCurrencySymbol(balance.amount.currency || 'MNT')}
            </strong>
          ))}
        </FormGroup>

        <FormGroup>
          <p>Product name</p>
          <strong>{account.productName}</strong>
        </FormGroup>

        <FormGroup>
          <p>Branch</p>
          <strong>{account.branchId}</strong>
        </FormGroup>
      </BlockRow>

      <BlockRow>
        <FormGroup>
          <p>Status</p>
          <strong>{getStatusValue(account.status)}</strong>
        </FormGroup>

        <FormGroup>
          <p>Registration</p>
          <strong>{isRel(account.isRelParty)}</strong>
        </FormGroup>

        <FormGroup>
          <p>Open date</p>
          <strong>{account.openDate}</strong>
        </FormGroup>
      </BlockRow>

      <BlockRow>
        <FormGroup>
          <Button
            btnStyle="simple"
            size="small"
            icon="money-insert"
            onClick={() => setShowTransfer(true)}
            disabled={!configId || !accountNumber}
          >
            Transfer
          </Button>
        </FormGroup>
      </BlockRow>

      {showTransfer && configId && accountNumber && (
        <TransactionForm
          configId={configId}
          accountNumber={accountNumber}
          accountName={account.accountName}
          onClose={() => setShowTransfer(false)}
        />
      )}
    </div>
  );

  const renderStatements = () => (
    <div>
      <h4>Latest transactions</h4>
      <Transactions
        account={account}
        balances={balances}
        showLatest
      />
    </div>
  );

  return (
    <>
      {renderAccount()}
      {renderStatements()}
    </>
  );
};

export default Detail;
