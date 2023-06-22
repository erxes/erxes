import * as compose from 'lodash.flowright';
import { Alert, getEnv, withProps } from '@erxes/ui/src/utils';

import Accounts from '../components/Accounts';
import Info from '@erxes/ui/src/components/Info';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries, mutations } from '../graphql';

type Props = {
  onSelectAccount: (accountId: string) => void;
  accountId: string;
};

type FinalProps = {
  accountsQuery: any;
  removeAccount: any;
  addAccount: any;
} & Props;
class AccountContainer extends React.Component<FinalProps, {}> {
  popupWindow(url, title, win, w, h) {
    const y = win.top.outerHeight / 2 + win.top.screenY - h / 2;
    const x = win.top.outerWidth / 2 + win.top.screenX - w / 2;

    return win.open(
      url,
      title,
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${y}, left=${x}`
    );
  }

  addAccount = (token: string) => {
    const { addAccount } = this.props;

    addAccount({ variables: { token } })
      .then(res => {
        const message = res.data.telegramAccountAdd;
        Alert.success(message);

        this.props.accountsQuery.refetch();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  removeAccount = (accountId: string) => {
    const { removeAccount } = this.props;

    removeAccount({ variables: { _id: accountId } })
      .then(() => {
        Alert.success('You successfully removed an account');

        this.props.accountsQuery.refetch();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  render() {
    const { accountsQuery, onSelectAccount, accountId } = this.props;

    if (accountsQuery.loading) {
      return <Spinner objective={true} />;
    }

    if (accountsQuery.error) {
      return <Info>{accountsQuery.error.message}</Info>;
    }

    const accounts = accountsQuery.telegramAccounts || [];

    return (
      <Accounts
        accountId={accountId}
        onSelectAccount={onSelectAccount}
        addAccount={this.addAccount}
        removeAccount={this.removeAccount}
        accounts={accounts}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(mutations.removeAccount), {
      name: 'removeAccount',
      options: {
        refetchQueries: ['accounts']
      }
    }),
    graphql<Props>(gql(queries.accounts), {
      name: 'accountsQuery'
    }),
    graphql<Props>(gql(mutations.addAccount), {
      name: 'addAccount',
      options: {
        refetchQueries: ['accounts']
      }
    })
  )(AccountContainer)
);
