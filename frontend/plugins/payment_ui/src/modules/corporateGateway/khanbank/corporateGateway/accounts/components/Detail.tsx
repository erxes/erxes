import { useEffect, useState } from 'react';
import { Button } from 'erxes-ui';
import { Card } from 'erxes-ui/components/card';
import { Dialog } from 'erxes-ui/components/dialog';
import { Switch } from 'erxes-ui/components/switch';

import TransactionForm from '../../transactions/containers/Form';
import Transactions from '../../transactions/containers/List';
import { IKhanbankAccount } from '../types';
import { getCurrencySymbol } from '../../../utils';

type Props = {
  queryParams: any;
  account: IKhanbankAccount;
};

const Detail = ({ account, queryParams }: Props) => {
  const accountNumber = queryParams.account;

  const defaultAccount = JSON.parse(
    localStorage.getItem('khanbankDefaultAccount') || '{}',
  );

  const [isChecked, setIsChecked] = useState(
    defaultAccount.accountNumber === accountNumber,
  );

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setIsChecked(defaultAccount.accountNumber === accountNumber);
  }, [accountNumber]);

  const toggleChange = (checked: boolean) => {
    setIsChecked(checked);

    if (!checked) {
      localStorage.removeItem('khanbankDefaultAccount');
      return;
    }

    localStorage.setItem(
      'khanbankDefaultAccount',
      JSON.stringify({
        accountNumber,
        configId: queryParams._id,
      }),
    );
  };

  const holderInfo = `${account.holderInfo?.custFirstName || ''} ${
    account.holderInfo?.custLastName || ''
  }`;

  return (
    <div className="space-y-6">
      {/* Account Info */}
      <Card className="p-6 space-y-6">
        <h3 className="text-lg font-semibold">Account Detail</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Account</p>
            <p className="font-medium">{accountNumber}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Account Holder</p>
            <p className="font-medium">{holderInfo}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="font-medium">
              {account.balance.toLocaleString()}{' '}
              {getCurrencySymbol(account.currency || 'MNT')}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-3">
            <span className="text-sm">Default account</span>
            <Switch checked={isChecked} onCheckedChange={toggleChange} />
          </div>

          <Button onClick={() => setOpen(true)}>Transfer</Button>
        </div>
      </Card>

      {/* Latest Transactions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Latest Transactions</h3>

        <Transactions queryParams={queryParams} account={account} showLatest />
      </Card>

      {/* Transfer Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="sm:max-w-lg">
          <Dialog.Header>
            <Dialog.Title>Transfer</Dialog.Title>
          </Dialog.Header>

          <TransactionForm
            configId={queryParams._id}
            accountNumber={accountNumber}
            closeModal={() => setOpen(false)}
          />
        </Dialog.Content>
      </Dialog>
    </div>
  );
};

export default Detail;
