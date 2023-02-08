import {
  AccountBox,
  AccountItem,
  AccountTitle
} from '@erxes/ui-inbox/src/settings/integrations/styles';
import { CenterText } from '@erxes/ui-log/src/activityLogs/styles';
import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import AddAccountForm from './AddAccountForm';

type Props = {
  accounts: any[];
  onAdd: () => void;
  removeAccount: (accountId: string) => void;
  onSelectAccount: (accountId: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
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
    const { onAdd, renderButton } = this.props;

    const AddButton = (
      <Button btnStyle="primary" icon="plus-circle" onClick={onAdd}>
        Add Account
      </Button>
    );

    const content = props => (
      <AddAccountForm {...props} renderButton={renderButton} onAdd={onAdd} />
    );

    return (
      <Button btnStyle="primary" icon="plus-circle" onClick={onAdd}>
        Connect to a Zalo OA
      </Button>
      // <ModalTrigger title="Add Account" trigger={AddButton} content={content} />
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
        <span>
          <img src={account.avatar} width="45" height="45" />
        </span>
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
          <AccountTitle>{__('Linked OA')}</AccountTitle>
          {this.renderAccounts()}
        </AccountBox>
        <CenterText>{__('OR')}</CenterText>
        <CenterText>{this.renderAccountAction()}</CenterText>
      </>
    );
  }
}

export default Accounts;
