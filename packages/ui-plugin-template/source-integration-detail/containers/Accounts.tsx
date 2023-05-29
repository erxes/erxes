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

  onAdd = () => {
    const { REACT_APP_API_URL } = getEnv();

    this.popupWindow(
      `${REACT_APP_API_URL}/pl:{name}/login`,
      'Integration',
      window,
      660,
      750
    );
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

    const accounts = accountsQuery.{name}Accounts || [];

    return (
      <Accounts
        accountId={accountId}
        onSelectAccount={onSelectAccount}
        onAdd={this.onAdd}
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
    })
  )(AccountContainer)
);
