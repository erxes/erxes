import { Alert, getEnv } from '@erxes/ui/src/utils';

import Accounts from '../components/Accounts';
import Info from '@erxes/ui/src/components/Info';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { queries, mutations } from '../graphql';
import { useQuery, useMutation } from '@apollo/client';
import { IButtonMutateProps } from '@erxes/ui/src/types';

type Props = {
  onSelectAccount: (accountId: string) => void;
  accountId: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const AccountContainer = (props: Props) => {
  const accountsQuery = useQuery(gql(queries.accounts));
  const [removeAccount] = useMutation(gql(mutations.removeAccount), {
    refetchQueries: ['accounts'],
  });

  const popupWindow = (url, title, win, w, h) => {
    const y = win.top.outerHeight / 2 + win.top.screenY - h / 2;
    const x = win.top.outerWidth / 2 + win.top.screenX - w / 2;

    return win.open(
      url,
      title,
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${y}, left=${x}`,
    );
  };

  const onAdd = () => {
    const { REACT_APP_API_URL } = getEnv();

    popupWindow(
      `${REACT_APP_API_URL}/pl:zalo/login`,
      'Integration',
      window,
      660,
      750,
    );
  };

  const removeAccountHandler = (accountId: string) => {
    removeAccount({ variables: { _id: accountId } })
      .then(() => {
        Alert.success('You successfully removed an account');

        accountsQuery.refetch();
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const { onSelectAccount, accountId } = props;

  if (accountsQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (accountsQuery.error) {
    return <Info>{accountsQuery.error.message}</Info>;
  }

  const accounts = accountsQuery?.data?.zaloGetAccounts || [];

  return (
    <Accounts
      accountId={accountId}
      onSelectAccount={onSelectAccount}
      onAdd={onAdd}
      removeAccount={removeAccountHandler}
      accounts={accounts}
      renderButton={props.renderButton}
    />
  );
};

export default AccountContainer;
