import {
  AccountBox,
  AccountItem,
  AccountTitle
} from '@erxes/ui-inbox/src/settings/integrations/styles';
import { CenterText } from '@erxes/ui-log/src/activityLogs/styles';
import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { __, confirm } from '@erxes/ui/src/utils';
import React from 'react';

type Props = {
  accounts: any[];
  onAdd: () => void;
  removeAccount: (accountId: string) => void;
  onSelectAccount: (accountId: string) => void;
  accountId: string;
};

class Accounts extends React.Component<Props> {
  onRemove(accountId: string) {
    const { removeAccount } = this.props;

    confirm().then(() => {
      removeAccount(accountId);
      this.setState({ accountId: '' });
    });
  }

  renderAccountAction() {
    const { onAdd } = this.props;

    return (
      <Button btnStyle="primary" icon="plus-circle" onClick={onAdd}>
        Add Account
      </Button>
    );
  }

  renderAccounts() {
    const { accounts, onSelectAccount, accountId } = this.props;

    if (accounts.length === 0) {
      return (
        <EmptyState icon="user-6" text={__('There is no linked accounts')} />
      );
    }

    return accounts.map(account => (
      <AccountItem key={account._id}>
        <span>{account.name}</span>

        <div>
          <Button
            onClick={() => onSelectAccount(account._id)}
            btnStyle={accountId === account._id ? 'primary' : 'simple'}
          >
            {accountId === account._id
              ? __('Selected')
              : __('Select This Account')}
          </Button>

          <Button
            onClick={this.onRemove.bind(this, account._id)}
            btnStyle="danger"
          >
            {__('Remove')}
          </Button>
        </div>
      </AccountItem>
    ));
  }

  render() {
    return (
      <>
        <AccountBox>
          <AccountTitle>{__('Linked Accounts')}</AccountTitle>
          {this.renderAccounts()}
        </AccountBox>
        <CenterText>{__('OR')}</CenterText>
        <CenterText>{this.renderAccountAction()}</CenterText>
      </>
    );
  }
}

export default Accounts;
