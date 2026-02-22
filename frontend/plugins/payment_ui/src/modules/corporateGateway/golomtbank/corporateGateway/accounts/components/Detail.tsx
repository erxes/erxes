import * as React from 'react';
import { Button } from 'erxes-ui/components/button';
import { useQueryState } from 'erxes-ui/hooks/use-query-state';

import Transactions from '../../transactions/containers/List';
import TransactionForm from '../../transactions/containers/Form';

import {
  IGolomtBankAccountDetail,
  IGolomtBankAccountBalance,
} from '../../../types/IGolomtAccount';

type Props = {
  queryParams: any;
  account: IGolomtBankAccountDetail;
  balances?: IGolomtBankAccountBalance;
  accountId?: string;
};

const Detail = ({ account, balances, queryParams }: Props) => {
  const [showTransfer, setShowTransfer] = React.useState(false);

  const getStatusValue = (value: string) => {
    switch (value) {
      case 'A':
        return 'active';
      case 'I':
        return 'inactive';
      case 'D':
        return 'dormant';
      default:
        return '-';
    }
  };

  const isRel = (value: string) => {
    switch (value) {
      case 'Y':
        return 'YES';
      case 'N':
        return 'NO';
      default:
        return '-';
    }
  };

  const renderField = (label: string, value?: React.ReactNode) => (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value ?? '-'}</p>
    </div>
  );

  const renderAccount = () => (
    <section className="space-y-6">
      <h4 className="text-sm font-semibold">Account detail</h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderField('Account', account.accountNumber)}
        {renderField('Account name', account.accountName)}
        {renderField('Customer name', account.customerName)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderField(
          'Balance',
          (balances?.balanceLL || []).map((balance) => (
            <div key={balance.amount.toString()}>
              {balance.amount.value.toLocaleString()}
              {balance.amount.currency ?? ' MNT'}
            </div>
          )),
        )}
        {renderField('Product name', account.productName)}
        {renderField('Branch', account.branchId)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderField('Status', getStatusValue(account.status))}
        {renderField('Registration', isRel(account.isRelParty))}
        {renderField('Open date', account.openDate)}
      </div>

      <div>
        <Button
          size="sm"
          onClick={() => setShowTransfer(true)}
          disabled={!queryParams?._id || !queryParams?.account}
        >
          Transfer
        </Button>
      </div>

      {showTransfer && (
        <TransactionForm
          configId={queryParams._id}
          accountNumber={queryParams.account}
          accountName={account.accountName}
          closeModal={() => setShowTransfer(false)}
        />
      )}
    </section>
  );

  const renderStatements = () => (
    <section className="space-y-4 pt-6">
      <h4 className="text-sm font-semibold">Latest transactions</h4>

      <Transactions queryParams={queryParams} showLatest />
    </section>
  );

  return (
    <div className="space-y-8">
      {renderAccount()}
      {renderStatements()}
    </div>
  );
};

export default Detail;
