import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert, withProps } from 'modules/common/utils';
import { mutations, queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Accounts } from '../components';
import { AccountsQueryResponse, RemoveAccountMutationResponse } from '../types';

type Props = {
  kind: 'facebook' | 'twitter' | 'gmail';
  onAdd: () => void;
  onSelect: (accountId?: string) => void;
  onRemove: (accountId: string) => void;
};

type FinalProps = {
  accountsQuery: AccountsQueryResponse;
} & Props &
  RemoveAccountMutationResponse;

class AccountContainer extends React.Component<FinalProps, {}> {
  render() {
    const { accountsQuery, onAdd, onRemove, onSelect } = this.props;

    if (accountsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const accounts = accountsQuery.accounts || [];

    const removeAccount = (accountId: string) => {
      this.props
        .removeAccount({
          variables: { _id: accountId }
        })
        .then(() => {
          Alert.success('Success');
          onRemove(accountId);
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    return (
      <Accounts
        onAdd={onAdd}
        removeAccount={removeAccount}
        onSelect={onSelect}
        accounts={accounts}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, RemoveAccountMutationResponse, { _id: string }>(
      gql(mutations.removeAccount),
      {
        name: 'removeAccount',
        options: {
          refetchQueries: ['accounts']
        }
      }
    ),
    graphql<Props, AccountsQueryResponse>(gql(queries.accounts), {
      name: 'accountsQuery',
      options: ({ kind }) => ({
        variables: {
          kind
        }
      })
    })
  )(AccountContainer)
);
