import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { IUser } from '@erxes/ui/src/auth/types';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps } from '@erxes/ui/src/utils';
import {
  DetailQueryResponse,
  AccountsConfigsQueryResponse,
  IAccount
} from '../../../types';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import AccountDetails from '../../../components/account/detail/AccountDetails';
import { queries } from '../../../graphql';

type Props = {
  id: string;
};

type FinalProps = {
  accountDetailQuery: DetailQueryResponse;
  accountsConfigsQuery: AccountsConfigsQueryResponse;
  currentUser: IUser;
} & Props;

const AccountDetailsContainer = (props: FinalProps) => {
  const { accountDetailQuery, currentUser } = props;

  if (accountDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!accountDetailQuery.accountDetail) {
    return (
      <EmptyState text="Account not found" image="/images/actions/24.svg" />
    );
  }

  const accountDetail = accountDetailQuery.accountDetail || ({} as IAccount);

  const updatedProps = {
    ...props,
    loading: accountDetailQuery.loading,
    account: accountDetail,
    currentUser
  };

  return <AccountDetails {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, DetailQueryResponse, { _id: string }>(
      gql(queries.accountDetail),
      {
        name: 'accountDetailQuery',
        options: ({ id }) => ({
          variables: {
            _id: id
          },
          notifyOnNetworkStatusChange: true,
          fetchPolicy: 'network-only'
        })
      }
    )
  )(AccountDetailsContainer)
);
